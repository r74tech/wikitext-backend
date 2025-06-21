import { getDb, transaction } from './kysely';
import type {
  IndexData,
  NewIndexData,
  IndexDataUpdate,
  RevisionData,
  NewRevisionData
} from './schema';

// IndexData operations
export async function insertIndexData(data: NewIndexData): Promise<IndexData> {
  const db = getDb();
  const result = await db
    .insertInto('indexdata')
    .values({
      ...data,
      revisionCount: data.revisionCount ?? 0,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return result;
}

export async function updateIndexData(
  shortId: string,
  data: IndexDataUpdate
): Promise<IndexData | undefined> {
  const db = getDb();
  const result = await db
    .updateTable('indexdata')
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where('shortId', '=', shortId)
    .returningAll()
    .executeTakeFirst();

  return result;
}

export async function getIndexData(shortId: string): Promise<IndexData | undefined> {
  const db = getDb();
  return await db
    .selectFrom('indexdata')
    .selectAll()
    .where('shortId', '=', shortId)
    .executeTakeFirst();
}

// RevisionData operations
export async function insertRevisionData(data: NewRevisionData): Promise<RevisionData> {
  const db = getDb();
  const result = await db
    .insertInto('revisiondata')
    .values({
      ...data,
      createdAt: data.createdAt ?? new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return result;
}

export async function getRevisionData(
  shortId: string,
  revisionId: number
): Promise<RevisionData | undefined> {
  const db = getDb();
  return await db
    .selectFrom('revisiondata')
    .selectAll()
    .where('shortId', '=', shortId)
    .where('id', '=', revisionId)
    .executeTakeFirst();
}

export async function getHistoryData(shortId: string): Promise<RevisionData[]> {
  const db = getDb();
  return await db
    .selectFrom('revisiondata')
    .selectAll()
    .where('shortId', '=', shortId)
    .orderBy('id', 'desc')
    .execute();
}

// Transaction-based operations
export async function createPageWithRevision(
  indexData: NewIndexData,
  revisionData: NewRevisionData
): Promise<{ indexData: IndexData; revisionData: RevisionData }> {
  return await transaction(async (trx) => {
    // Insert index data
    const newIndexData = await trx
      .insertInto('indexdata')
      .values({
        ...indexData,
        revisionCount: 0,
        updatedAt: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Insert revision data
    const newRevisionData = await trx
      .insertInto('revisiondata')
      .values({
        ...revisionData,
        revisionCount: 0,
        createdAt: new Date().toISOString(),
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
  revisionData: NewRevisionData
): Promise<{ indexData: IndexData; revisionData: RevisionData } | null> {
  return await transaction(async (trx) => {
    // Check if page exists
    const existing = await trx
      .selectFrom('indexdata')
      .selectAll()
      .where('shortId', '=', shortId)
      .executeTakeFirst();

    if (!existing) {
      return null;
    }

    // Update index data (trigger will increment revisionCount)
    const updatedIndex = await trx
      .updateTable('indexdata')
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where('shortId', '=', shortId)
      .returningAll()
      .executeTakeFirstOrThrow();

    // Insert new revision with the updated revision count
    const newRevision = await trx
      .insertInto('revisiondata')
      .values({
        ...revisionData,
        revisionCount: updatedIndex.revisionCount,
        createdAt: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      indexData: updatedIndex,
      revisionData: newRevision,
    };
  });
}