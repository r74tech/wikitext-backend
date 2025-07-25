import type { Context, Next } from "hono";
import type { Env } from "../types/bindings";

/**
 * Security headers middleware for API
 * Applies security headers appropriate for JSON API responses
 */
export async function securityHeaders(c: Context<{ Bindings: Env }>, next: Next) {
    await next();

    // Strict CSP for API - no resources needed for JSON responses
    c.header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");

    // Security headers
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("X-XSS-Protection", "0"); // Disabled in modern browsers, can cause issues
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header(
        "Permissions-Policy",
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
    );

    // HSTS (only for HTTPS)
    if (c.req.url.startsWith("https://")) {
        c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }

    // Remove server identification
    c.res.headers.delete("X-Powered-By");
    c.res.headers.delete("Server");
}
