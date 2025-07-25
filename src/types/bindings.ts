import type { LogLevel } from "../config/constants";

export interface Env {
    DB: D1Database;

    CORS_ORIGINS: string;

    LOG_LEVEL: LogLevel;
}
