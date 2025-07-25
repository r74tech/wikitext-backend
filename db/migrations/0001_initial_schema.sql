-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create indexdata table (based on db/migrations/001_initial_schema.ts)
CREATE TABLE IF NOT EXISTS indexdata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "shortId" TEXT UNIQUE NOT NULL,
    title TEXT,
    source TEXT,
    "revisionCount" INTEGER DEFAULT 0,
    "createdAt" TEXT DEFAULT (datetime('now')),
    "createdBy" TEXT,
    "updatedAt" TEXT DEFAULT (datetime('now')),
    "updatedBy" TEXT
);

-- Create revisiondata table
CREATE TABLE IF NOT EXISTS revisiondata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    "shortId" TEXT NOT NULL,
    title TEXT,
    source TEXT,
    "createdAt" TEXT DEFAULT (datetime('now')),
    "createdBy" TEXT,
    "revisionCount" INTEGER DEFAULT 0,
    FOREIGN KEY ("shortId") REFERENCES indexdata("shortId")
);

-- Create indexes (matching PostgreSQL migration)
CREATE INDEX IF NOT EXISTS idx_indexdata_shortid ON indexdata("shortId");
CREATE INDEX IF NOT EXISTS idx_revisiondata_shortid ON revisiondata("shortId");
CREATE INDEX IF NOT EXISTS idx_revisiondata_created_at ON revisiondata("createdAt");

-- D1 doesn't support functions/procedures like PostgreSQL
-- Implement revision count increment logic
CREATE TRIGGER IF NOT EXISTS update_revision_count
BEFORE UPDATE ON indexdata
FOR EACH ROW
WHEN (OLD.source IS NOT NEW.source OR OLD.title IS NOT NEW.title)
BEGIN
    UPDATE indexdata
    SET "revisionCount" = OLD."revisionCount" + 1
    WHERE id = NEW.id;
END;

-- Implement timestamp update logic
CREATE TRIGGER IF NOT EXISTS update_timestamp
BEFORE UPDATE ON indexdata
FOR EACH ROW
BEGIN
    UPDATE indexdata
    SET "updatedAt" = datetime('now')
    WHERE id = NEW.id;
END;