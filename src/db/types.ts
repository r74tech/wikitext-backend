import type { ColumnType, Generated } from "kysely";

export interface Database {
    indexdata: IndexDataTable;
    revisiondata: RevisionDataTable;
}

export interface IndexDataTable {
    id: Generated<number>;
    shortId: string;
    title: string | null;
    source: string | null;
    revisionCount: ColumnType<number, number | undefined, never>;
    createdAt: ColumnType<string, string | undefined, never>;
    createdBy: string | null;
    updatedAt: ColumnType<string, string | undefined, never>;
    updatedBy: string | null;
}

export interface RevisionDataTable {
    id: Generated<number>;
    shortId: string;
    title: string | null;
    source: string | null;
    createdAt: ColumnType<string, string | undefined, never>;
    createdBy: string | null;
    revisionCount: number;
}
