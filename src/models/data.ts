export interface DataResponse<T> {
    data: T | null;
    error?: string;
    details?: unknown;
}

export interface SaveDataRequest {
    title: string;
    source: string;
    createdBy: string;
}

export interface ClientPageData {
    shortId: string;
    title: string;
    source: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    revisionCount: number;
}

export interface ClientRevisionData {
    revisionId: number; // Database ID of the revision
    shortId: string;
    title: string;
    source: string;
    revisionCount: number; // Revision number (0-based)
    createdAt: string;
    createdBy: string;
}

export interface IndexData {
    id?: number;
    shortId: string;
    title: string;
    source: string;
    revisionCount: number;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}

export interface NewIndexData {
    shortId: string;
    title: string;
    source: string;
    revisionCount: number;
    createdBy: string;
    updatedBy: string;
}

export interface IndexDataUpdate {
    title?: string;
    source?: string;
    updatedBy: string;
}

export interface RevisionData {
    id?: number;
    shortId: string;
    title: string;
    source: string;
    createdAt: string;
    createdBy: string;
    revisionCount: number;
}

export interface NewRevisionData {
    shortId: string;
    title: string;
    source: string;
    createdBy: string;
    revisionCount: number;
}
