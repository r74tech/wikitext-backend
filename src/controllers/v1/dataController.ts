import * as db from "../../db/queries";
import type { IndexData, IndexDataUpdate, NewIndexData, NewRevisionData } from "../../db/schema";
import type { ClientPageData, ClientRevisionData, DataResponse } from "../../models/data";
import { generateNanoid } from "../../utils/nanoid";

function toClientPageData(indexData: IndexData): ClientPageData {
    return {
        shortId: indexData.shortId,
        title: indexData.title ?? "",
        source: indexData.source ?? "",
        createdAt: new Date(indexData.createdAt).toISOString(),
        createdBy: indexData.createdBy ?? "",
        updatedAt: new Date(indexData.updatedAt).toISOString(),
        updatedBy: indexData.updatedBy ?? "",
        revisionCount: indexData.revisionCount,
    };
}

export async function getPageData(shortId: string): Promise<DataResponse<ClientPageData>> {
    try {
        const indexData = await db.getIndexData(shortId);

        if (!indexData) {
            return { data: null, error: "Page not found" };
        }

        const pageData = toClientPageData(indexData);
        return { data: pageData };
    } catch (error) {
        console.error("Error getting page data:", error);
        return { data: null, error: "Failed to retrieve page data" };
    }
}

export async function getPageRevisionData(
    shortId: string,
    revisionId: number,
): Promise<DataResponse<ClientRevisionData>> {
    try {
        const revisionData = await db.getRevisionData(shortId, revisionId);

        if (!revisionData) {
            return { data: null, error: "Revision not found" };
        }

        const pageData: ClientRevisionData = {
            revisionId: revisionData.id,
            shortId: revisionData.shortId,
            title: revisionData.title ?? "",
            source: revisionData.source ?? "",
            revisionCount: revisionData.revisionCount,
            createdAt: new Date(revisionData.createdAt).toISOString(),
            createdBy: revisionData.createdBy ?? "",
        };

        return { data: pageData };
    } catch (error) {
        console.error("Error getting revision data:", error);
        return { data: null, error: "Failed to retrieve revision data" };
    }
}

export async function getPageHistoryData(
    shortId: string,
): Promise<DataResponse<ClientRevisionData[]>> {
    try {
        const historyData = await db.getHistoryData(shortId);

        const revisionData: ClientRevisionData[] = historyData.map((data) => ({
            revisionId: data.id,
            shortId: data.shortId,
            title: data.title ?? "",
            source: data.source ?? "",
            revisionCount: data.revisionCount,
            createdAt: new Date(data.createdAt).toISOString(),
            createdBy: data.createdBy ?? "",
        }));

        return { data: revisionData };
    } catch (error) {
        console.error("Error getting history data:", error);
        return { data: null, error: "Failed to retrieve history data" };
    }
}

export async function createData(
    title: string,
    source: string,
    createdBy: string,
): Promise<DataResponse<ClientPageData>> {
    try {
        const shortId = generateNanoid();

        const indexData: NewIndexData = {
            shortId,
            title,
            source,
            revisionCount: 0,
            createdBy,
            updatedBy: createdBy,
        };

        const revisionData: NewRevisionData = {
            shortId,
            title,
            source,
            createdBy,
            revisionCount: 0,
        };

        const result = await db.createPageWithRevision(indexData, revisionData);

        if (!result) {
            return { data: null, error: "Failed to create page" };
        }

        const pageData = toClientPageData(result.indexData);
        return { data: pageData };
    } catch (error) {
        console.error("Error creating page:", error);
        return { data: null, error: "Failed to create page" };
    }
}

export async function updateData(
    shortId: string,
    title: string,
    source: string,
    createdBy: string,
): Promise<DataResponse<ClientPageData>> {
    try {
        const updateData: IndexDataUpdate = {
            title,
            source,
            updatedBy: createdBy,
        };

        const revisionData: NewRevisionData = {
            shortId,
            title,
            source,
            createdBy,
            revisionCount: 0,
        };

        const result = await db.updatePageWithRevision(shortId, updateData, revisionData);

        if (!result) {
            return { data: null, error: "Page not found" };
        }

        const pageData = toClientPageData(result.indexData);
        return { data: pageData };
    } catch (error) {
        console.error("Error updating page:", error);
        return { data: null, error: "Failed to update page" };
    }
}
