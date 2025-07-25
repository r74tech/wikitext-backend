import type { Context as HonoContext } from "hono";
import type { Env } from "./bindings";

export type AppContext = HonoContext<{ Bindings: Env }>;

export type ShortId = string;

export type RevisionId = number;

export type Username = string;

export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

export interface ResponseMetadata {
    requestId?: string;
    timestamp: string;
    version: string;
}
