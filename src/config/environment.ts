import dotenv from 'dotenv';

// Load environment variables only in development (not in Docker)
if (!process.env.DATABASE_URL && !process.env.DATABASE_HOST) {
  dotenv.config();
}

export interface Config {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGINS: string[];
  LOG_LEVEL: string;
  WIKIDOT_API_KEY?: string;
  WIKIDOT_SITE_ID?: string;
}

function parseEnv(): Config {
  const {
    NODE_ENV = 'development',
    PORT = '3000',
    DATABASE_URL,
    DATABASE_HOST,
    DATABASE_PORT = '5432',
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD,
    CORS_ORIGINS = 'http://localhost:3000',
    LOG_LEVEL = 'info',
    WIKIDOT_API_KEY,
    WIKIDOT_SITE_ID,
  } = process.env;

  // Construct DATABASE_URL from individual components if not provided
  let dbUrl = DATABASE_URL;
  if (!dbUrl && DATABASE_HOST) {
    if (!DATABASE_NAME || !DATABASE_USER || !DATABASE_PASSWORD) {
      throw new Error('Database configuration incomplete. Need DATABASE_HOST, DATABASE_NAME, DATABASE_USER, and DATABASE_PASSWORD');
    }
    dbUrl = `postgres://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;
  }

  if (!dbUrl) {
    throw new Error('DATABASE_URL or database connection parameters required');
  }

  return {
    NODE_ENV,
    PORT: Number.parseInt(PORT, 10),
    DATABASE_URL: dbUrl,
    CORS_ORIGINS: CORS_ORIGINS.split(',').map(origin => origin.trim()),
    LOG_LEVEL,
    WIKIDOT_API_KEY,
    WIKIDOT_SITE_ID,
  };
}

export const config = parseEnv();