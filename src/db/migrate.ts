import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import { Migrator, FileMigrationProvider } from 'kysely';
import { getDb } from './kysely';

const migrator = new Migrator({
  db: getDb(),
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(process.cwd(), 'db', 'migrations'),
  }),
});

async function migrateToLatest() {
  const { error, results } = await migrator.migrateToLatest();

  if (results) {
    for (const it of results) {
      if (it.status === 'Success') {
        console.log(`✓ Applied migration: ${it.migrationName}`);
      } else if (it.status === 'Error') {
        console.error(`✗ Failed to apply migration: ${it.migrationName}`);
      }
    }
  }

  if (error) {
    console.error('Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

async function migrateDown() {
  const { error, results } = await migrator.migrateDown();

  if (results) {
    for (const it of results) {
      if (it.status === 'Success') {
        console.log(`✓ Reverted migration: ${it.migrationName}`);
      } else if (it.status === 'Error') {
        console.error(`✗ Failed to revert migration: ${it.migrationName}`);
      }
    }
  }

  if (error) {
    console.error('Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];

  console.log('Running Kysely migrations...');

  try {
    switch (command) {
      case 'up':
        await migrateToLatest();
        console.log('All migrations completed successfully!');
        break;
      case 'down':
        await migrateDown();
        console.log('Migration reverted successfully!');
        break;
      default:
        console.log('Usage: bun run migrate.ts [up|down]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await getDb().destroy();
  }
}

main();