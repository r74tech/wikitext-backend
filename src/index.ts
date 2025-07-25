import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import { securityHeaders } from "./middleware/security";
import { setupRoutes } from "./routes";
import type { Env } from "./types/bindings";

const app = new Hono<{ Bindings: Env }>();

app.use(honoLogger());
app.use("*", errorHandler);
app.use("*", corsMiddleware);
app.use("*", securityHeaders);

setupRoutes(app);

app.notFound((c) => {
    return c.json(
        {
            data: null,
            error: "Endpoint not found",
        },
        404,
    );
});

export default app;
