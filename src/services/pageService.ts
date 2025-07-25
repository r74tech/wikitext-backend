import type { Kysely } from "kysely";
import { ERROR_MESSAGES } from "../config/constants";
import * as db from "../db/queries";
import type { Database } from "../db/types";
import { DatabaseError, NotFoundError } from "../errors/AppError";
import type { ClientPageData, ClientRevisionData, DataResponse } from "../models/data";
import { toClientPageData, toClientRevisionData } from "../utils/dataTransformers";
import type { Logger } from "../utils/logger";
import { generateNanoid } from "../utils/nanoid";

export class PageService {
    constructor(
        private database: Kysely<Database>,
        private logger: Logger,
    ) {}

    async getPage(shortId: string): Promise<DataResponse<ClientPageData>> {
        try {
            this.logger.debug("Getting page data", { shortId });
            const indexData = await db.getIndexData(this.database, shortId);

            if (!indexData) {
                throw new NotFoundError(ERROR_MESSAGES.PAGE_NOT_FOUND);
            }

            const pageData = toClientPageData(indexData);
            return { data: pageData };
        } catch (error) {
            if (error instanceof NotFoundError) {
                return { data: null, error: error.message };
            }
            this.logger.error("Failed to get page data", error, { shortId });
            return { data: null, error: ERROR_MESSAGES.FAILED_TO_RETRIEVE_DATA };
        }
    }

    async getPageRevision(
        shortId: string,
        revisionId: number,
    ): Promise<DataResponse<ClientRevisionData>> {
        try {
            this.logger.debug("Getting revision data", { shortId, revisionId });
            const revisionData = await db.getRevisionData(this.database, shortId, revisionId);

            if (!revisionData) {
                throw new NotFoundError(ERROR_MESSAGES.REVISION_NOT_FOUND);
            }

            const clientData = toClientRevisionData(revisionData);
            return { data: clientData };
        } catch (error) {
            if (error instanceof NotFoundError) {
                return { data: null, error: error.message };
            }
            this.logger.error("Failed to get revision data", error, {
                shortId,
                revisionId,
            });
            return { data: null, error: ERROR_MESSAGES.FAILED_TO_RETRIEVE_REVISION };
        }
    }

    async getPageHistory(shortId: string): Promise<DataResponse<ClientRevisionData[]>> {
        try {
            this.logger.debug("Getting page history", { shortId });
            const historyData = await db.getHistoryData(this.database, shortId);
            const revisionData = historyData.map(toClientRevisionData);
            return { data: revisionData };
        } catch (error) {
            this.logger.error("Failed to get history data", error, { shortId });
            return { data: null, error: ERROR_MESSAGES.FAILED_TO_RETRIEVE_HISTORY };
        }
    }

    async createPage(
        title: string,
        source: string,
        createdBy: string,
    ): Promise<DataResponse<ClientPageData>> {
        try {
            const shortId = generateNanoid();
            this.logger.info("Creating new page", { shortId, title, createdBy });

            const indexData = {
                shortId,
                title,
                source,
                revisionCount: 0,
                createdBy,
                updatedBy: createdBy,
            };

            const revisionData = {
                shortId,
                title,
                source,
                createdBy,
                revisionCount: 0,
            };

            const result = await db.createPageWithRevision(this.database, indexData, revisionData);

            if (!result) {
                throw new DatabaseError(ERROR_MESSAGES.FAILED_TO_CREATE_PAGE);
            }

            const pageData = toClientPageData(result.indexData);
            this.logger.info("Page created successfully", { shortId });
            return { data: pageData };
        } catch (error) {
            this.logger.error("Failed to create page", error, { title, createdBy });
            return { data: null, error: ERROR_MESSAGES.FAILED_TO_CREATE_PAGE };
        }
    }

    async updatePage(
        shortId: string,
        title: string,
        source: string,
        updatedBy: string,
    ): Promise<DataResponse<ClientPageData>> {
        try {
            this.logger.info("Updating page", { shortId, title, updatedBy });

            const existing = await db.getIndexData(this.database, shortId);
            if (!existing) {
                throw new NotFoundError(ERROR_MESSAGES.PAGE_NOT_FOUND);
            }

            const updateData = {
                title,
                source,
                updatedBy,
            };

            const revisionData = {
                shortId,
                title,
                source,
                createdBy: updatedBy,
                revisionCount: 0,
            };

            const result = await db.updatePageWithRevision(
                this.database,
                shortId,
                updateData,
                revisionData,
            );

            if (!result) {
                throw new NotFoundError(ERROR_MESSAGES.PAGE_NOT_FOUND);
            }

            const pageData = toClientPageData(result.indexData);
            this.logger.info("Page updated successfully", { shortId });
            return { data: pageData };
        } catch (error) {
            if (error instanceof NotFoundError) {
                return { data: null, error: error.message };
            }
            this.logger.error("Failed to update page", error, {
                shortId,
                title,
                updatedBy,
            });
            return { data: null, error: ERROR_MESSAGES.FAILED_TO_UPDATE_PAGE };
        }
    }
}
