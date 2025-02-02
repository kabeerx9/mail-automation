import { z } from 'zod';

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public status: 'fail' | 'error' = 'error'
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'fail');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'fail');
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, 'fail');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'fail');
    }
}

export interface ErrorResponse {
    success: false;
    status: 'fail' | 'error';
    message: string;
    errors?: Array<{ field?: string; message: string }>;
}
