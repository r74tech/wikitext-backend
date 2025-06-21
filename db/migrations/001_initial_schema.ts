import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create indexdata table
  await db.schema
    .createTable('indexdata')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('shortId', 'text', (col) => col.notNull().unique())
    .addColumn('title', 'text')
    .addColumn('source', 'text')
    .addColumn('hashedPassword', 'text')
    .addColumn('revisionCount', 'integer', (col) => col.defaultTo(0))
    .addColumn('updatedAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedBy', 'text')
    .execute();

  // Create revisiondata table
  await db.schema
    .createTable('revisiondata')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('shortId', 'text', (col) => col.notNull())
    .addColumn('title', 'text')
    .addColumn('source', 'text')
    .addColumn('hashedPassword', 'text')
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('createdBy', 'text')
    .addColumn('revisionCount', 'integer', (col) => col.defaultTo(0))
    .addForeignKeyConstraint('fk_revisiondata_shortid', ['shortId'], 'indexdata', ['shortId'])
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_indexdata_shortid')
    .on('indexdata')
    .column('shortId')
    .execute();

  await db.schema
    .createIndex('idx_revisiondata_shortid')
    .on('revisiondata')
    .column('shortId')
    .execute();

  await db.schema
    .createIndex('idx_revisiondata_created_at')
    .on('revisiondata')
    .column('createdAt')
    .execute();

  // Create function for revision count increment
  await sql`
    CREATE OR REPLACE FUNCTION increment_revision_count_on_update()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW."revisionCount" := OLD."revisionCount" + 1;
      NEW."updatedAt" := CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Create trigger
  await sql`
    CREATE TRIGGER update_revision_count
      BEFORE UPDATE ON indexdata
      FOR EACH ROW
      WHEN (OLD.source IS DISTINCT FROM NEW.source OR OLD.title IS DISTINCT FROM NEW.title)
      EXECUTE FUNCTION increment_revision_count_on_update();
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS update_revision_count ON indexdata`.execute(db);
  await sql`DROP FUNCTION IF EXISTS increment_revision_count_on_update()`.execute(db);
  await db.schema.dropTable('revisiondata').execute();
  await db.schema.dropTable('indexdata').execute();
}