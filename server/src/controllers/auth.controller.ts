import { Request, Response } from 'express';
import config from '../config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

interface TokenPayload {
    id: string;
    email: string;
    name?: string;
    type: 'access' | 'refresh';
    has_configured: boolean;
}

export class AuthController {
  register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        })
    }

    try {
        // Check if user exists using Prisma
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });


        if(existingUser){
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user using Prisma
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                refreshToken: ''
            }
        });

        // create both access and refresh token
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

        // Update user's refresh token using Prisma
        await prisma.user.update({
            where: { id: newUser.id },
            data: { refreshToken: await bcrypt.hash(refreshToken, 10) }
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            accessToken: token,
            refreshToken: refreshToken
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
  }

  login = async (req : Request , res: Response) => {
    const { email, password } = req.body;

    try {
        // Find user using Prisma
        const user = await prisma.user.findUnique({
            where: { email },
            include: { configuration: true }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
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

        // Update refresh token using Prisma
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: await bcrypt.hash(refreshToken, 10) }
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
  }

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if(!refreshToken){
        return res.status(401).json({
            success: false,
            message: 'Refresh token is required'
        })
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, config.jwt_refresh_secret) as TokenPayload;

        // Check if it's actually a refresh token
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        // Find the user using Prisma
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify the refresh token matches what we have stored
        const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isValidRefreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email, name: user.name, type: 'access' } as TokenPayload,
            config.jwt_secret,
            { expiresIn: '1h' }
        );

        const newRefreshToken = jwt.sign(
            { id: user.id, email: user.email, name: user.name, type: 'refresh' } as TokenPayload,
            config.jwt_refresh_secret,
            { expiresIn: '7d' }
        );

        // Update stored refresh token using Prisma
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
        return res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
  }

  getStatus = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Auth service is running'
    })
  }
}
