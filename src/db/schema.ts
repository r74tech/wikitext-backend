import type { ColumnType, Generated, Selectable, Insertable, Updateable } from 'kysely';

export interface IndexDataTable {
  id: Generated<number>;
  shortId: string;
  title: string | null;
  source: string | null;
  hashedPassword: string | null;
  revisionCount: ColumnType<number, number | undefined, number>;
  createdAt: ColumnType<Date, string | undefined, string>;
  createdBy: string | null;
  updatedAt: ColumnType<Date, string | undefined, string>;
  updatedBy: string | null;
  // Future fields
  wikidotPageId: string | null;
  wikidotSiteId: string | null;
  wikidotLastSync: Date | null;
  metadata: ColumnType<unknown, unknown | undefined, unknown>;
}

export interface RevisionDataTable {
  id: Generated<number>;
  shortId: string;
  title: string | null;
  source: string | null;
  hashedPassword: string | null;
  createdAt: ColumnType<Date, string | undefined, never>;
  createdBy: string | null;
  revisionCount: number;
  // Future fields
  wikidotRevisionId: string | null;
}

export interface WikidotSyncLogTable {
  id: Generated<number>;
  shortId: string;
  wikidotPageId: string | null;
  syncType: 'import' | 'export' | 'sync';
  syncStatus: 'pending' | 'success' | 'failed';
  errorMessage: string | null;
  metadata: ColumnType<unknown, unknown | undefined, unknown>;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export interface MigrationsTable {
  id: Generated<number>;
  filename: string;
  appliedAt: ColumnType<Date, string | undefined, never>;
}

export interface Database {
  indexdata: IndexDataTable;
  revisiondata: RevisionDataTable;
  wikidot_sync_log: WikidotSyncLogTable;
  migrations: MigrationsTable;
}

export type IndexData = Selectable<IndexDataTable>;
export type NewIndexData = Insertable<IndexDataTable>;
export type IndexDataUpdate = Updateable<IndexDataTable>;

export type RevisionData = Selectable<RevisionDataTable>;
export type NewRevisionData = Insertable<RevisionDataTable>;

export type WikidotSyncLog = Selectable<WikidotSyncLogTable>;
export type NewWikidotSyncLog = Insertable<WikidotSyncLogTable>;