// SaveDataRequest: Request for saving data
export interface SaveDataRequest {
    shortId: string;
    title: string;
    source: string;
    createdBy: string;
    hashedPassword?: string;
}

// DataResponse: API response type
export interface DataResponse<T> {
    data: T | null;
    error: string | null;
}

// ClientPageData: Page data returned to client
export interface ClientPageData {
    title: string;
    source: string;
    shortId: string;
    revisionCount: number;
    updatedAt: string;
    updatedBy: string;
}

// ClientRevisionData: Revision data returned to client
export interface ClientRevisionData {
    revisionId: number;
    shortId: string;
    title: string;
    source: string;
    revisionCount: number;
    createdAt: string;
    createdBy: string;
}

// IndexData: indexdata table record type
export interface IndexData {
    id?: number;
    shortId: string;
    title: string;
    source: string;
    hashedPassword?: string;
    revisionCount: number;
    updatedAt: string;
    updatedBy: string;
    // Future fields
    wikidotPageId?: string;
    wikidotSiteId?: string;
    wikidotLastSync?: string;
    metadata?: unknown;
}

// RevisionData: revisiondata table record type
export interface RevisionData {
    id: number;
    shortId: string;
    title: string;
    source: string;
    hashedPassword?: string;
    createdAt: string;
    createdBy: string;
    revisionCount: number;
    // Future fields
    wikidotRevisionId?: string;
}

// WikidotSyncLog: Wikidot sync log record type
export interface WikidotSyncLog {
    id: number;
    shortId: string;
    wikidotPageId?: string;
    syncType: 'import' | 'export' | 'sync';
    syncStatus: 'pending' | 'success' | 'failed';
    errorMessage?: string;
    metadata?: unknown;
    createdAt: string;
}