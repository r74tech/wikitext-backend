import type { Context, Next } from "hono";
import { cors as honoCors } from "hono/cors";
import type { Env } from "../types/bindings";
import { Logger } from "../utils/logger";

export function createCorsMiddleware(c: Context<{ Bindings: Env }>) {
    const logger = new Logger(c);

    const corsOrigins = c.env.CORS_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);

    if (corsOrigins.includes("*")) {
        logger.warn("Using wildcard (*) for CORS origins is not recommended");
    }

    logger.debug("CORS origins configured", { origins: corsOrigins });

    return honoCors({
        origin: corsOrigins,
        allowHeaders: ["Upgrade-Insecure-Requests", "Content-Type"],
        allowMethods: ["POST", "GET", "PATCH", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    });
}

export async function corsMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
    const corsHandler = createCorsMiddleware(c);
    return corsHandler(c, next);
}
