import { Request, Response } from 'express';
import config from '../config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    refreshToken: string;
}

interface TokenPayload {
    id: string;
    email: string;
    name?: string;
    type: 'access' | 'refresh';
}

export class AuthController {
    private users : User[] = []

  register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        })
    }

    // check if user already exists
    if(this.users.find((user: User) => user.email === email)){
        return res.status(400).json({
            success: false,
            message: 'User already exists'
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser : User = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        refreshToken: ''
    }

    this.users.push(newUser);

    // create both access and refresh token
    const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name, type: 'access' } as TokenPayload,
        config.jwt_secret,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name, type: 'refresh' } as TokenPayload,
        config.jwt_refresh_secret,
        { expiresIn: '7d' }
    );

    newUser.refreshToken = await bcrypt.hash(refreshToken, 10);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        accessToken: token,
        refreshToken: refreshToken
    })
  }

  login = async (req : Request , res: Response)=>{
    const { email, password } = req.body;

    const user = this.users.find((user: User) => user.email === email);
    console.log(user);
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

    const accessToken = jwt.sign(
            { id: user.id, email: user.email, name: user.name, type: 'access' } as TokenPayload,
        config.jwt_secret,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { id: user.id, email: user.email, name: user.name, type: 'refresh' } as TokenPayload,
        config.jwt_refresh_secret,
            { expiresIn: '7d' }
    );

    user.refreshToken = await bcrypt.hash(refreshToken, 10);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken
    })
  }

  getStatus = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Auth service is running'
    })
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

        // Find the user
        const user = this.users.find(user => user.id === decoded.id);
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

        // Update stored refresh token
        user.refreshToken = await bcrypt.hash(newRefreshToken, 10);

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
}
