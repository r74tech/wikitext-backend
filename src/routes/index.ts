import type { Hono } from "hono";
import { LOG_LEVELS } from "../config/constants";
import {
    createData,
    getPageData,
    getPageHistoryData,
    getPageRevisionData,
    updateData,
} from "../controllers/v1/dataController";
import type { Env } from "../types/bindings";

export function setupRoutes(app: Hono<{ Bindings: Env }>) {
    app.get("/", (c) => {
        const isProduction = c.env.LOG_LEVEL !== LOG_LEVELS.DEBUG;

        return c.json({
            message: "Welcome to the Wikitext Previewer API",
            version: "2.0.0",
            environment: isProduction ? "production" : "development",
            endpoints: {
                health: "/v1/health",
                data: {
                    create: "POST /v1/data",
                    get: "GET /v1/data/:shortId",
                    update: "PATCH /v1/data/:shortId",
                },
                history: {
                    list: "POST /v1/data/:shortId/history",
                    revision: "POST /v1/data/:shortId/revision/:revisionNumber",
                },
            },
        });
    });

    app.get("/v1/health", (c) => {
        const isProduction = c.env.LOG_LEVEL !== LOG_LEVELS.DEBUG;

        return c.json({
            status: "healthy",
            version: "2.0.0",
            environment: isProduction ? "production" : "development",
            timestamp: new Date().toISOString(),
        });
    });

    app.post("/v1/data", createData);
    app.get("/v1/data/:shortId", getPageData);
    app.patch("/v1/data/:shortId", updateData);

    app.post("/v1/data/:shortId/history", getPageHistoryData);
    app.post("/v1/data/:shortId/revision/:revisionNumber", getPageRevisionData);
}
