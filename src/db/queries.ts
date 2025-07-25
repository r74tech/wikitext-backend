import type { Kysely } from "kysely";
import { DatabaseError } from "../errors/AppError";
import type {
    IndexData,
    IndexDataUpdate,
    NewIndexData,
    NewRevisionData,
    RevisionData,
} from "../models/data";
import { toIndexData, toRevisionData } from "../utils/dataTransformers";
import type { Database } from "./types";

export async function insertIndexData(
    db: Kysely<Database>,
    data: NewIndexData,
): Promise<IndexData> {
    const result = await db
        .insertInto("indexdata")
        .values({
            shortId: data.shortId,
            title: data.title,
            source: data.source,
            updatedBy: data.updatedBy,
            revisionCount: 0,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return toIndexData(result);
}

export async function updateIndexData(
    db: Kysely<Database>,
    shortId: string,
    data: IndexDataUpdate,
): Promise<IndexData | undefined> {
    const result = await db
        .updateTable("indexdata")
        .set({
            title: data.title,
            source: data.source,
            updatedBy: data.updatedBy,
        })
        .where("shortId", "=", shortId)
        .returningAll()
        .executeTakeFirst();

    return result ? toIndexData(result) : undefined;
}

export async function getIndexData(
    db: Kysely<Database>,
    shortId: string,
): Promise<IndexData | undefined> {
    const result = await db
        .selectFrom("indexdata")
        .selectAll()
        .where("shortId", "=", shortId)
        .executeTakeFirst();

    return result ? toIndexData(result) : undefined;
}

export async function insertRevisionData(
    db: Kysely<Database>,
    data: NewRevisionData,
): Promise<RevisionData> {
    const result = await db
        .insertInto("revisiondata")
        .values({
            shortId: data.shortId,
            title: data.title,
            source: data.source,
            createdBy: data.createdBy,
            revisionCount: data.revisionCount,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return toRevisionData(result);
}

export async function getRevisionData(
    db: Kysely<Database>,
    shortId: string,
    revisionId: number,
): Promise<RevisionData | undefined> {
    const result = await db
        .selectFrom("revisiondata")
        .selectAll()
        .where("shortId", "=", shortId)
        .where("id", "=", revisionId)
        .executeTakeFirst();

    return result ? toRevisionData(result) : undefined;
}

export async function getHistoryData(
    db: Kysely<Database>,
    shortId: string,
): Promise<RevisionData[]> {
    const results = await db
        .selectFrom("revisiondata")
        .selectAll()
        .where("shortId", "=", shortId)
        .orderBy("id", "desc")
        .execute();

    return results.map(toRevisionData);
}

export async function createPageWithRevision(
    db: Kysely<Database>,
    indexData: NewIndexData,
    revisionData: NewRevisionData,
): Promise<{ indexData: IndexData; revisionData: RevisionData }> {
    let createdIndexData: IndexData | undefined;

    try {
        const newIndexData = await db
            .insertInto("indexdata")
            .values({
                shortId: indexData.shortId,
                title: indexData.title,
                source: indexData.source,
                updatedBy: indexData.updatedBy,
                revisionCount: 0,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        createdIndexData = toIndexData(newIndexData);

        const newRevisionData = await db
            .insertInto("revisiondata")
            .values({
                shortId: revisionData.shortId,
                title: revisionData.title,
                source: revisionData.source,
                createdBy: revisionData.createdBy,
                revisionCount: 0,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return {
            indexData: createdIndexData,
            revisionData: toRevisionData(newRevisionData),
        };
    } catch (error) {
        if (createdIndexData) {
            try {
                await db.deleteFrom("indexdata").where("shortId", "=", indexData.shortId).execute();
            } catch {}
        }
        throw new DatabaseError(
            `Failed to create page: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }
}

export async function updatePageWithRevision(
    db: Kysely<Database>,
    shortId: string,
    updateData: IndexDataUpdate,
    revisionData: NewRevisionData,
): Promise<{ indexData: IndexData; revisionData: RevisionData } | null> {
    const existing = await db
        .selectFrom("indexdata")
        .selectAll()
        .where("shortId", "=", shortId)
        .executeTakeFirst();

    if (!existing) {
        return null;
    }

    try {
        const updatedIndex = await db
            .updateTable("indexdata")
            .set({
                title: updateData.title,
                source: updateData.source,
                updatedBy: updateData.updatedBy,
            })
            .where("shortId", "=", shortId)
            .returningAll()
            .executeTakeFirstOrThrow();

        const newRevision = await db
            .insertInto("revisiondata")
            .values({
                shortId: revisionData.shortId,
                title: revisionData.title,
                source: revisionData.source,
                createdBy: revisionData.createdBy,
                revisionCount: updatedIndex.revisionCount,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return {
            indexData: toIndexData(updatedIndex),
            revisionData: toRevisionData(newRevision),
        };
    } catch (error) {
        throw new DatabaseError(
            `Failed to update page: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }
}
