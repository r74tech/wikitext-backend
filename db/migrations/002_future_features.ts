import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
		await db.schema
		.alterTable("indexdata")
		.addColumn("wikidotPageId", "text")
		.addColumn("wikidotSiteId", "text")
		.addColumn("wikidotLastSync", "timestamptz")
		.addColumn("metadata", "jsonb", (col) => col.defaultTo(sql`'{}'::jsonb`))
		.execute();

		await db.schema.alterTable("revisiondata").addColumn("wikidotRevisionId", "text").execute();

		await db.schema
		.createTable("wikidot_sync_log")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("shortId", "text", (col) => col.notNull())
		.addColumn("wikidotPageId", "text")
		.addColumn("sync_type", "text", (col) =>
			col.notNull().check(sql`sync_type IN ('import', 'export', 'sync')`),
		)
		.addColumn("sync_status", "text", (col) =>
			col.notNull().check(sql`sync_status IN ('pending', 'success', 'failed')`),
		)
		.addColumn("error_message", "text")
		.addColumn("metadata", "jsonb", (col) => col.defaultTo(sql`'{}'::jsonb`))
		.addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addForeignKeyConstraint("fk_wikidot_sync_shortid", ["shortId"], "indexdata", ["shortId"])
		.execute();

		await db.schema
		.createIndex("idx_indexdata_wikidot")
		.on("indexdata")
		.columns(["wikidotPageId", "wikidotSiteId"])
		.execute();

	await db.schema
		.createIndex("idx_wikidot_sync_log_shortid")
		.on("wikidot_sync_log")
		.column("shortId")
		.execute();

	await db.schema
		.createIndex("idx_wikidot_sync_log_created")
		.on("wikidot_sync_log")
		.column("created_at")
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("wikidot_sync_log").execute();

	await db.schema.alterTable("revisiondata").dropColumn("wikidotRevisionId").execute();

	await db.schema
		.alterTable("indexdata")
		.dropColumn("wikidotPageId")
		.dropColumn("wikidotSiteId")
		.dropColumn("wikidotLastSync")
		.dropColumn("metadata")
		.execute();
}
