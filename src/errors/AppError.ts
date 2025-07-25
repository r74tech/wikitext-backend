import { HTTP_STATUS } from "../config/constants";

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
        public isOperational: boolean = true,
    ) {
        super(message);
        this.name = this.constructor.name;
        // captureStackTraceはNode.js環境でのみ利用可能
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, HTTP_STATUS.BAD_REQUEST, true);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, HTTP_STATUS.NOT_FOUND, true);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string) {
        super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
    }
}
