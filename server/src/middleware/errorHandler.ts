import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError, ErrorResponse } from '../types/errors';
import { Prisma } from '@prisma/client';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
) => {
    // Default error
    let statusCode = 500;
    let message = 'Internal server error';
    let status: 'fail' | 'error' = 'error';
    let errors: Array<{ field?: string; message: string }> | undefined;

    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
        statusCode = 400;
        status = 'fail';
        message = 'Validation failed';
        errors = err.errors.map(error => ({
            field: error.path.join('.'),
            message: error.message
        }));
    }
    // Handle our custom AppError
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        status = err.status;
    }
    // Handle Prisma errors
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        statusCode = 400;
        status = 'fail';

        switch (err.code) {
            case 'P2002':
                message = 'Unique constraint violation';
                break;
            case 'P2025':
                message = 'Record not found';
                statusCode = 404;
                break;
            default:
                message = 'Database error';
        }
    }

    // Development vs Production error
    const error = {
        success: false as const,
        status,
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack
        })
    };

    res.status(statusCode).json(error);
};
