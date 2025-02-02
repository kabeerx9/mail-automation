import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import config from '../config';
import { TokenPayload } from '../types';
import { z } from 'zod';
import { UnauthorizedError, ValidationError, NotFoundError } from '../types/errors';

// Validation schemas
const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

export class AuthController {
    register = async (req: Request, res: Response) => {
        // Validate request body
        const validatedData = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            throw new ValidationError('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword
            }
        });

        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                type: 'access',
                has_configured: false
            } as TokenPayload,
            config.jwt_secret,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                type: 'refresh',
                has_configured: false
            } as TokenPayload,
            config.jwt_refresh_secret,
            { expiresIn: '7d' }
        );

        // Update user's refresh token
        await prisma.user.update({
            where: { id: newUser.id },
            data: { refreshToken: await bcrypt.hash(refreshToken, 10) }
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            accessToken: token,
            refreshToken: refreshToken
        });
    }

    login = async (req: Request, res: Response) => {
        // Validate request body
        const validatedData = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
            include: { configuration: true }
        });

        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const hasConfiguration = user.configuration !== null;

        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                type: 'access',
                has_configured: hasConfiguration
            } as TokenPayload,
            config.jwt_secret,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                type: 'refresh',
                has_configured: hasConfiguration
            } as TokenPayload,
            config.jwt_refresh_secret,
            { expiresIn: '7d' }
        );

        // Update refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: await bcrypt.hash(refreshToken, 10) }
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken
        });
    }

    refreshToken = async (req: Request, res: Response) => {
        // Validate request body
        const { refreshToken } = refreshTokenSchema.parse(req.body);

        try {
            const decoded = jwt.verify(refreshToken, config.jwt_refresh_secret) as TokenPayload;

            if (decoded.type !== 'refresh') {
                throw new UnauthorizedError('Invalid token type');
            }

            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                include: { configuration: true }
            });

            if (!user || !user.refreshToken) {
                throw new UnauthorizedError('Invalid refresh token');
            }

            const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);

            if (!isValidRefreshToken) {
                throw new UnauthorizedError('Invalid refresh token');
            }

            const hasConfiguration = user.configuration !== null;

            const newAccessToken = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    type: 'access',
                    has_configured: hasConfiguration
                } as TokenPayload,
                config.jwt_secret,
                { expiresIn: '1h' }
            );

            const newRefreshToken = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    type: 'refresh',
                    has_configured: hasConfiguration
                } as TokenPayload,
                config.jwt_refresh_secret,
                { expiresIn: '7d' }
            );

            // Update stored refresh token
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: await bcrypt.hash(newRefreshToken, 10) }
            });

            return res.status(200).json({
                success: true,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Invalid refresh token');
            }
            throw error;
        }
    }

    getStatus = async (_req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: 'Auth service is running'
        });
    }
}
