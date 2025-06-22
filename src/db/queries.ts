import { getDb, transaction } from "./kysely";
import type {
    IndexData,
    IndexDataUpdate,
    NewIndexData,
    NewRevisionData,
    RevisionData,
} from "./schema";

export async function insertIndexData(data: NewIndexData): Promise<IndexData> {
    const db = getDb();
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...insertData } = data;
    const result = await db
        .insertInto("indexdata")
        .values({
            ...insertData,
            revisionCount: insertData.revisionCount ?? 0,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return result;
}

export async function updateIndexData(
    shortId: string,
    data: IndexDataUpdate,
): Promise<IndexData | undefined> {
    const db = getDb();
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...updateData } = data;
    const result = await db
        .updateTable("indexdata")
        .set({
            ...updateData,
        })
        .where("shortId", "=", shortId)
        .returningAll()
        .executeTakeFirst();

    return result;
}

export async function getIndexData(shortId: string): Promise<IndexData | undefined> {
    const db = getDb();
    return await db
        .selectFrom("indexdata")
        .selectAll()
        .where("shortId", "=", shortId)
        .executeTakeFirst();
}

export async function insertRevisionData(data: NewRevisionData): Promise<RevisionData> {
    const db = getDb();
    const { createdAt: _createdAt, ...insertData } = data;
    const result = await db
        .insertInto("revisiondata")
        .values({
            ...insertData,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return result;
}

export async function getRevisionData(
    shortId: string,
    revisionId: number,
): Promise<RevisionData | undefined> {
    const db = getDb();
    return await db
        .selectFrom("revisiondata")
        .selectAll()
        .where("shortId", "=", shortId)
        .where("id", "=", revisionId)
        .executeTakeFirst();
}

export async function getHistoryData(shortId: string): Promise<RevisionData[]> {
    const db = getDb();
    return await db
        .selectFrom("revisiondata")
        .selectAll()
        .where("shortId", "=", shortId)
        .orderBy("id", "desc")
        .execute();
}

export async function createPageWithRevision(
    indexData: NewIndexData,
    revisionData: NewRevisionData,
): Promise<{ indexData: IndexData; revisionData: RevisionData }> {
    return await transaction(async (trx) => {
        const { createdAt: _createdAt, updatedAt: _updatedAt, ...cleanIndexData } = indexData;
        const newIndexData = await trx
            .insertInto("indexdata")
            .values({
                ...cleanIndexData,
                revisionCount: 0,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        const { createdAt: _revCreatedAt, ...cleanRevisionData } = revisionData;
        const newRevisionData = await trx
            .insertInto("revisiondata")
            .values({
                ...cleanRevisionData,
                revisionCount: 0,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return {
            indexData: newIndexData,
            revisionData: newRevisionData,
        };
    });
}

export async function updatePageWithRevision(
    shortId: string,
    updateData: IndexDataUpdate,
    revisionData: NewRevisionData,
): Promise<{ indexData: IndexData; revisionData: RevisionData } | null> {
    return await transaction(async (trx) => {
        const existing = await trx
            .selectFrom("indexdata")
            .selectAll()
            .where("shortId", "=", shortId)
            .executeTakeFirst();

        if (!existing) {
            return null;
        }

        const { createdAt: _createdAt, updatedAt: _updatedAt, ...cleanUpdateData } = updateData;
        const updatedIndex = await trx
            .updateTable("indexdata")
            .set(cleanUpdateData)
            .where("shortId", "=", shortId)
            .returningAll()
            .executeTakeFirstOrThrow();

        const { createdAt: _revCreatedAt, ...cleanRevisionData } = revisionData;
        const newRevision = await trx
            .insertInto("revisiondata")
            .values({
                ...cleanRevisionData,
                revisionCount: updatedIndex.revisionCount,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return {
            indexData: updatedIndex,
            revisionData: newRevision,
        };
    });
}
