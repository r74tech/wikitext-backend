import dotenv from 'dotenv';

// Load environment variables only in development (not in Docker)
if (!process.env.DATABASE_URL) {
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
    CORS_ORIGINS = 'http://localhost:3000',
    LOG_LEVEL = 'info',
    WIKIDOT_API_KEY,
    WIKIDOT_SITE_ID,
  } = process.env;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return {
    NODE_ENV,
    PORT: Number.parseInt(PORT, 10),
    DATABASE_URL,
    CORS_ORIGINS: CORS_ORIGINS.split(',').map(origin => origin.trim()),
    LOG_LEVEL,
    WIKIDOT_API_KEY,
    WIKIDOT_SITE_ID,
  };
}

export const config = parseEnv();