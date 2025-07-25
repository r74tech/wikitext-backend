import type { Context } from "hono";
import { LOG_LEVELS, type LogLevel } from "../config/constants";
import type { Env } from "../types/bindings";

interface LogContext {
    requestId?: string;
    method?: string;
    path?: string;
    statusCode?: number;
    duration?: number;
    [key: string]: unknown;
}

export class Logger {
    private logLevel: LogLevel;

    constructor(context: Context<{ Bindings: Env }>) {
        this.logLevel = (context.env.LOG_LEVEL as LogLevel) || LOG_LEVELS.INFO;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = [LOG_LEVELS.DEBUG, LOG_LEVELS.INFO, LOG_LEVELS.WARN, LOG_LEVELS.ERROR];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const targetLevelIndex = levels.indexOf(level);
        return targetLevelIndex >= currentLevelIndex;
    }

    private formatLog(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...context,
        };
        return JSON.stringify(logEntry);
    }

    debug(message: string, context?: LogContext): void {
        if (this.shouldLog(LOG_LEVELS.DEBUG)) {
            console.debug(this.formatLog(LOG_LEVELS.DEBUG, message, context));
        }
    }

    info(message: string, context?: LogContext): void {
        if (this.shouldLog(LOG_LEVELS.INFO)) {
            console.info(this.formatLog(LOG_LEVELS.INFO, message, context));
        }
    }

    warn(message: string, context?: LogContext): void {
        if (this.shouldLog(LOG_LEVELS.WARN)) {
            console.warn(this.formatLog(LOG_LEVELS.WARN, message, context));
        }
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        if (this.shouldLog(LOG_LEVELS.ERROR)) {
            const errorContext = {
                ...context,
                error:
                    error instanceof Error
                        ? {
                              name: error.name,
                              message: error.message,
                              stack: this.logLevel === LOG_LEVELS.DEBUG ? error.stack : undefined,
                          }
                        : error,
            };
            console.error(this.formatLog(LOG_LEVELS.ERROR, message, errorContext));
        }
    }
}
