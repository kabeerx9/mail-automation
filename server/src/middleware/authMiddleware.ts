import config from '../config';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { TokenUser } from '../types';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log("I am inside auth middleware")
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }
    try {
        const decoded = jwt.verify(token, config.jwt_secret) as TokenUser;
        req.user = decoded;
        console.log("success in auth middleware")
        next()
    } catch (error) {
        console.log("failed in auth middleware")
        res.status(401).json({
            success: false,
            message: 'Failed to authenticate token',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
