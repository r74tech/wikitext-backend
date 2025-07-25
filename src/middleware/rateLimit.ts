import type { Context, Next } from "hono";
import type { Env } from "../types/bindings";
import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../config/constants";

/**
 * Simple in-memory rate limiter for Cloudflare Workers
 * Note: This is per-worker instance and will reset on worker restart
 * For production, use Cloudflare Rate Limiting or Durable Objects
 */
export class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    private readonly windowMs: number;
    private readonly maxRequests: number;

    constructor(windowMs: number = 60000, maxRequests: number = 60) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    isAllowed(key: string): boolean {
        const now = Date.now();
        const requests = this.requests.get(key) || [];

        // Remove old requests outside the window
        const validRequests = requests.filter((time) => now - time < this.windowMs);

        if (validRequests.length >= this.maxRequests) {
            this.requests.set(key, validRequests);
            return false;
        }

        validRequests.push(now);
        this.requests.set(key, validRequests);

        // Clean up old entries periodically
        if (Math.random() < 0.01) {
            this.cleanup();
        }

        return true;
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, requests] of this.requests.entries()) {
            const validRequests = requests.filter((time) => now - time < this.windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validRequests);
            }
        }
    }
}

// Global rate limiter instance (per worker)
const globalRateLimiter = new RateLimiter(60000, 60); // 60 requests per minute

/**
 * Rate limiting middleware
 * Uses client IP as the key for rate limiting
 */
export async function rateLimitMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
    // Get client IP from Cloudflare headers
    const clientIp =
        c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown";

    if (!globalRateLimiter.isAllowed(clientIp)) {
        throw new AppError(
            "Too many requests. Please try again later.",
            HTTP_STATUS.TOO_MANY_REQUESTS,
        );
    }

    await next();
}

/**
 * Cloudflare Rate Limiting configuration (recommended)
 * This should be configured in Cloudflare Dashboard or via API
 *
 * Example configuration:
 * - Threshold: 60 requests per minute
 * - Action: Challenge or Block
 * - Characteristics: IP Address
 */
export const CLOUDFLARE_RATE_LIMIT_CONFIG = {
    rules: [
        {
            expression: '(http.request.uri.path matches "^/v1/")',
            threshold: 60,
            period: 60,
            action: "challenge",
        },
        {
            expression: '(http.request.uri.path eq "/v1/data" and http.request.method eq "POST")',
            threshold: 10,
            period: 60,
            action: "block",
        },
    ],
};
