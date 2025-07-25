export const VALIDATION_CONSTANTS = {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 256,
    SOURCE_MAX_LENGTH: 200_000,
    USERNAME_MIN_LENGTH: 1,
    USERNAME_MAX_LENGTH: 50,
    USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
    SHORT_ID_LENGTH: 10,
} as const;

export const NANOID_CONFIG = {
    ALPHABET: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    LENGTH: 10,
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
} as const;

export const ERROR_MESSAGES = {
    INVALID_REQUEST_DATA: "Invalid request data",
    PAGE_NOT_FOUND: "Page not found",
    REVISION_NOT_FOUND: "Revision not found",
    FAILED_TO_CREATE_PAGE: "Failed to create page",
    FAILED_TO_UPDATE_PAGE: "Failed to update page",
    FAILED_TO_RETRIEVE_DATA: "Failed to retrieve data",
    FAILED_TO_RETRIEVE_HISTORY: "Failed to retrieve history",
    FAILED_TO_RETRIEVE_REVISION: "Failed to retrieve revision",
    INTERNAL_SERVER_ERROR: "Internal server error",
} as const;

export const LOG_LEVELS = {
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
} as const;

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
