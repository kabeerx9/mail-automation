import config from '../config';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken'

// Add this interface
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log("I am inside auth middleware")
const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }
  try {
    const decoded = jwt.verify(token,config.jwt_secret);
    req.user = decoded;
    console.log("sucess in auth middleware")
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
