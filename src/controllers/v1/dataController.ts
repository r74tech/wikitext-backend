import type { Context } from "hono";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../config/constants";
import { createDb } from "../../db/client";
import { ValidationError } from "../../errors/AppError";
import { PageService } from "../../services/pageService";
import type { Env } from "../../types/bindings";
import { Logger } from "../../utils/logger";
import {
    createPageRequestSchema,
    revisionNumberParamSchema,
    shortIdParamSchema,
    updatePageRequestSchema,
} from "../../validation/schemas";

function formatValidationError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return ERROR_MESSAGES.INVALID_REQUEST_DATA;
}

export async function getPageData(c: Context<{ Bindings: Env }>): Promise<Response> {
    const logger = new Logger(c);
    const shortId = c.req.param("shortId");

    try {
        const validatedShortId = shortIdParamSchema.parse(shortId);

        const db = createDb(c.env);
        const pageService = new PageService(db, logger);
        const response = await pageService.getPage(validatedShortId);

        return c.json(response);
    } catch (error) {
        if (error instanceof ValidationError) {
            return c.json(
                { data: null, error: formatValidationError(error) },
                HTTP_STATUS.BAD_REQUEST,
            );
        }
        return c.json(
            { data: null, error: ERROR_MESSAGES.FAILED_TO_RETRIEVE_DATA },
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
    }
}

export async function getPageRevisionData(c: Context<{ Bindings: Env }>): Promise<Response> {
    const logger = new Logger(c);
    const shortId = c.req.param("shortId");
    const revisionNumberStr = c.req.param("revisionNumber");
    
    logger.debug("getPageRevisionData called", { shortId, revisionNumberStr });

    try {
        const validatedShortId = shortIdParamSchema.parse(shortId);
        const validatedRevisionNumber = revisionNumberParamSchema.parse(revisionNumberStr);

        const db = createDb(c.env);
        const pageService = new PageService(db, logger);
        const response = await pageService.getPageRevision(validatedShortId, validatedRevisionNumber);

        return c.json(response);
    } catch (error) {
        logger.error("Error in getPageRevisionData", error, { shortId, revisionNumberStr });
        if (error instanceof ValidationError) {
            return c.json(
                { data: null, error: formatValidationError(error) },
                HTTP_STATUS.BAD_REQUEST,
            );
        }
        return c.json(
            { data: null, error: ERROR_MESSAGES.FAILED_TO_RETRIEVE_REVISION },
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
    }
}

export async function getPageHistoryData(c: Context<{ Bindings: Env }>): Promise<Response> {
    const logger = new Logger(c);
    const shortId = c.req.param("shortId");

    try {
        const validatedShortId = shortIdParamSchema.parse(shortId);

        const db = createDb(c.env);
        const pageService = new PageService(db, logger);
        const response = await pageService.getPageHistory(validatedShortId);

        return c.json(response);
    } catch (error) {
        if (error instanceof ValidationError) {
            return c.json(
                { data: null, error: formatValidationError(error) },
                HTTP_STATUS.BAD_REQUEST,
            );
        }
        return c.json(
            { data: null, error: ERROR_MESSAGES.FAILED_TO_RETRIEVE_HISTORY },
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
    }
}

export async function createData(c: Context<{ Bindings: Env }>): Promise<Response> {
    const logger = new Logger(c);

    try {
        const body = await c.req.json();

        const validatedData = createPageRequestSchema.parse(body);

        const db = createDb(c.env);
        const pageService = new PageService(db, logger);
        const response = await pageService.createPage(
            validatedData.title,
            validatedData.source,
            validatedData.createdBy,
        );

        logger.debug("POST /v1/data response", {
            statusCode: response.data ? HTTP_STATUS.CREATED : HTTP_STATUS.BAD_REQUEST,
            shortId: response.data?.shortId,
        });

        return c.json(response, response.data ? HTTP_STATUS.CREATED : HTTP_STATUS.BAD_REQUEST);
    } catch (error) {
        logger.error("Error in POST /data", error);
        if (error instanceof ValidationError) {
            return c.json(
                { data: null, error: formatValidationError(error) },
                HTTP_STATUS.BAD_REQUEST,
            );
        }
        return c.json(
            { data: null, error: ERROR_MESSAGES.INVALID_REQUEST_DATA },
            HTTP_STATUS.BAD_REQUEST,
        );
    }
}

export async function updateData(c: Context<{ Bindings: Env }>): Promise<Response> {
    const logger = new Logger(c);
    const shortId = c.req.param("shortId");

    try {
        const validatedShortId = shortIdParamSchema.parse(shortId);

        const body = await c.req.json();

        const validatedData = updatePageRequestSchema.parse(body);

        const db = createDb(c.env);
        const pageService = new PageService(db, logger);
        const response = await pageService.updatePage(
            validatedShortId,
            validatedData.title,
            validatedData.source,
            validatedData.updatedBy,
        );

        logger.debug("PATCH /v1/data response", {
            statusCode: response.data ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST,
            shortId: validatedShortId,
        });

        return c.json(response, response.data ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST);
    } catch (error) {
        logger.error("Error in PATCH /data/:shortId", error, { shortId });
        if (error instanceof ValidationError) {
            return c.json(
                { data: null, error: formatValidationError(error) },
                HTTP_STATUS.BAD_REQUEST,
            );
        }
        return c.json(
            { data: null, error: ERROR_MESSAGES.INVALID_REQUEST_DATA },
            HTTP_STATUS.BAD_REQUEST,
        );
    }
}
