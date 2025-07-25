import type { Context } from "hono";
import { ZodError } from "zod";
import { ERROR_MESSAGES, HTTP_STATUS, LOG_LEVELS } from "../config/constants";
import { AppError } from "../errors/AppError";
import type { Env } from "../types/bindings";
import { Logger } from "../utils/logger";

export async function errorHandler(
    c: Context<{ Bindings: Env }>,
    next: () => Promise<void>,
): Promise<Response | undefined> {
    const logger = new Logger(c);

    try {
        await next();
        return;
    } catch (err) {
        logger.error("Unhandled error", err);

        if (err instanceof ZodError) {
            const errors = err.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            }));

            return c.json(
                {
                    data: null,
                    error: ERROR_MESSAGES.INVALID_REQUEST_DATA,
                    details: c.env.LOG_LEVEL === LOG_LEVELS.DEBUG ? errors : undefined,
                } as const,
                HTTP_STATUS.BAD_REQUEST as 400,
            );
        }

        if (err instanceof AppError) {
            return c.json(
                {
                    data: null,
                    error: err.message,
                } as const,
                err.statusCode as 400 | 401 | 403 | 404 | 500,
            );
        }

        const isDevelopment = c.env.LOG_LEVEL === LOG_LEVELS.DEBUG;
        const errorMessage =
            isDevelopment && err instanceof Error
                ? err.message
                : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

        return c.json(
            {
                data: null,
                error: errorMessage,
            } as const,
            HTTP_STATUS.INTERNAL_SERVER_ERROR as 500,
        );
    }
}
