import type { ClientPageData, ClientRevisionData, IndexData, RevisionData } from "../models/data";

export function ensureString(value: string | null | undefined): string {
    return value ?? "";
}

export function toIndexData(row: {
    id: number;
    shortId: string;
    title: string | null;
    source: string | null;
    revisionCount: number;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string;
    updatedBy: string | null;
}): IndexData {
    return {
        id: row.id,
        shortId: row.shortId,
        title: ensureString(row.title),
        source: ensureString(row.source),
        revisionCount: row.revisionCount,
        createdAt: new Date(row.createdAt).toISOString(),
        createdBy: ensureString(row.createdBy),
        updatedAt: new Date(row.updatedAt).toISOString(),
        updatedBy: ensureString(row.updatedBy),
    };
}

export function toRevisionData(row: {
    id: number;
    shortId: string;
    title: string | null;
    source: string | null;
    createdAt: string;
    createdBy: string | null;
    revisionCount: number;
}): RevisionData {
    return {
        id: row.id,
        shortId: row.shortId,
        title: ensureString(row.title),
        source: ensureString(row.source),
        createdAt: new Date(row.createdAt).toISOString(),
        createdBy: ensureString(row.createdBy),
        revisionCount: row.revisionCount,
    };
}

export function toClientPageData(indexData: IndexData): ClientPageData {
    return {
        shortId: indexData.shortId,
        title: indexData.title,
        source: indexData.source,
        createdAt: indexData.updatedAt,
        createdBy: indexData.createdBy,
        updatedAt: indexData.updatedAt,
        updatedBy: indexData.updatedBy,
        revisionCount: indexData.revisionCount,
    };
}

export function toClientRevisionData(revisionData: RevisionData): ClientRevisionData {
    return {
        revisionId: revisionData.id ?? 0,
        shortId: revisionData.shortId,
        title: revisionData.title,
        source: revisionData.source,
        revisionCount: revisionData.revisionCount,
        createdAt: revisionData.createdAt,
        createdBy: revisionData.createdBy,
    };
}
