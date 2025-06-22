import type { Context } from "hono";
import type * as ftmlModule from "../../lib/ftml-wasm/wj-ftml-wasm";

interface GlobalLocation {
    href: string;
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
}

let ftml: typeof ftmlModule;
let isInitialized = false;

async function ensureInitialized() {
    if (!isInitialized) {
        try {
            if (!("location" in globalThis)) {
                (globalThis as typeof globalThis & { location: GlobalLocation }).location = {
                    href: "file:///",
                    protocol: "file:",
                    host: "",
                    hostname: "",
                    port: "",
                    pathname: "/",
                    search: "",
                    hash: "",
                };
            }

            if (
                typeof global !== "undefined" &&
                !("location" in (global as typeof global & { location?: GlobalLocation }))
            ) {
                (global as typeof global & { location: GlobalLocation }).location = (
                    globalThis as typeof globalThis & { location: GlobalLocation }
                ).location;
            }

            ftml = await import("../../lib/ftml-wasm/wj-ftml-wasm.js");

            await ftml.init();
            isInitialized = true;
        } catch (error) {
            console.error("Failed to initialize FTML:", error);
            throw error;
        }
    }
}

export async function parseFtml(c: Context) {
    try {
        await ensureInitialized();

        const body = await c.req.json();
        const { source, pageInfo = {}, mode = "page", layout = "wikijump" } = body;

        if (!source) {
            return c.json({ error: "Source is required" }, 400);
        }

        const info = ftml.makeInfo(pageInfo);
        const parseResult = ftml.parse(source, info, mode, layout);

        return c.json({
            success: true,
            data: parseResult,
        });
    } catch (error) {
        console.error("FTML parse error:", error);
        return c.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            },
            500,
        );
    }
}

export async function renderFtml(c: Context) {
    try {
        await ensureInitialized();

        let body: {
            source?: string;
            pageInfo?: Record<string, unknown>;
            mode?: string;
            layout?: string;
        };
        try {
            body = await c.req.json();
        } catch (jsonError) {
            console.error("JSON parse error:", jsonError);
            return c.json(
                {
                    success: false,
                    error: "Invalid JSON in request body",
                },
                400,
            );
        }

        const { source, pageInfo = {}, mode = "page", layout = "wikijump" } = body;

        if (!source) {
            return c.json({ error: "Source is required" }, 400);
        }

        const info = ftml.makeInfo(pageInfo);
        const renderResult = ftml.renderHTML(source, info, mode, layout);

        return c.json({
            success: true,
            data: renderResult,
        });
    } catch (error) {
        console.error("FTML render error:", error);
        return c.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            },
            500,
        );
    }
}

export async function detailRenderFtml(c: Context) {
    try {
        await ensureInitialized();

        const body = await c.req.json();
        const { source, pageInfo = {}, mode = "page", layout = "wikijump" } = body;

        if (!source) {
            return c.json({ error: "Source is required" }, 400);
        }

        const info = ftml.makeInfo(pageInfo);
        const detailResult = ftml.detailRenderHTML(source, info, mode, layout);

        return c.json({
            success: true,
            data: detailResult,
        });
    } catch (error) {
        console.error("FTML detail render error:", error);
        return c.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            },
            500,
        );
    }
}

export async function renderText(c: Context) {
    try {
        await ensureInitialized();

        const body = await c.req.json();
        const { source, pageInfo = {}, mode = "page", layout = "wikijump" } = body;

        if (!source) {
            return c.json({ error: "Source is required" }, 400);
        }

        const info = ftml.makeInfo(pageInfo);
        const textResult = ftml.renderText(source, info, mode, layout);

        return c.json({
            success: true,
            data: {
                text: textResult,
            },
        });
    } catch (error) {
        console.error("FTML render text error:", error);
        return c.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            },
            500,
        );
    }
}

export async function getWordCount(c: Context) {
    try {
        await ensureInitialized();

        const body = await c.req.json();
        const { source, pageInfo = {}, mode = "page", layout = "wikijump" } = body;

        if (!source) {
            return c.json({ error: "Source is required" }, 400);
        }

        const info = ftml.makeInfo(pageInfo);
        const parsed = ftml.parse(source, info, mode, layout);
        const count = ftml.wordCount(parsed);

        return c.json({
            success: true,
            data: {
                wordCount: count,
            },
        });
    } catch (error) {
        console.error("FTML word count error:", error);
        return c.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            },
            500,
        );
    }
}
