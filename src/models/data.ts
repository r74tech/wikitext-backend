export interface SaveDataRequest {
	shortId: string;
	title: string;
	source: string;
	createdBy: string;
	hashedPassword?: string;
}

export interface DataResponse<T> {
	data: T | null;
	error?: string;
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
	revisionId: number;
	shortId: string;
	title: string;
	source: string;
	revisionCount: number;
	createdAt: string;
	createdBy: string;
}

export interface IndexData {
	id?: number;
	shortId: string;
	title: string;
	source: string;
	hashedPassword?: string;
	revisionCount: number;
	updatedAt: string;
	updatedBy: string;
	wikidotPageId?: string;
	wikidotSiteId?: string;
	wikidotLastSync?: string;
	metadata?: unknown;
}

export interface RevisionData {
	id: number;
	shortId: string;
	title: string;
	source: string;
	hashedPassword?: string;
	createdAt: string;
	createdBy: string;
	revisionCount: number;
	wikidotRevisionId?: string;
}

export interface WikidotSyncLog {
	id: number;
	shortId: string;
	wikidotPageId?: string;
	syncType: "import" | "export" | "sync";
	syncStatus: "pending" | "success" | "failed";
	errorMessage?: string;
	metadata?: unknown;
	createdAt: string;
}
