# Wikitext Backend

Wikitext preview API built with Cloudflare Workers, Hono, and D1 database.

## Features

- Create and update wiki pages with revision history
- Full revision history tracking with automatic revision counting
- Deployed globally on Cloudflare's edge network
- D1 SQLite database with type-safe queries (Kysely)
- CORS support for web applications
- Multi-environment support (staging/production)
- FTML rendering via external WASM module
- Zero-config deployment with Wrangler

## Prerequisites

- Node.js 18+ or Bun
- Cloudflare account with Workers and D1 access
- Wrangler CLI (`npm install -g wrangler`)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wikitext-backend.git
cd wikitext-backend
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Create D1 databases:
```bash
# Create staging database
wrangler d1 create wikitext-db-stg

# Create production database  
wrangler d1 create wikitext-db-prd
```

4. Update `wrangler.toml` with your database IDs:
```toml
[[env.stg.d1_databases]]
database_id = "YOUR_STG_DATABASE_ID"

[[env.prd.d1_databases]]
database_id = "YOUR_PRD_DATABASE_ID"
```

5. Run migrations:
```bash
# For local development
npm run db:migrate:local

# For staging
npm run db:migrate:stg

# For production
npm run db:migrate:prd
```

## Development

```bash
# Start development server (staging environment)
npm run dev

# Start with production config
npm run dev:prd
```

The API will be available at `http://localhost:8787`

## Deployment

### Manual Deployment

```bash
# Deploy to staging
npm run deploy:stg

# Deploy to production
npm run deploy:prd
```

### Automated Deployment (GitHub Actions)

The project includes automated deployment workflows:
- Push to `develop` branch → Deploy to staging
- Push to `main` branch → Deploy to production
- FTML WASM module is automatically deployed to GitHub Pages

## API Endpoints

### Health Check
- `GET /` - API info and available endpoints
- `GET /v1/health` - Health status

### Data Management
- `POST /v1/data` - Create new wiki page
  ```json
  {
    "title": "Page Title",
    "source": "Wiki content",
    "createdBy": "username"
  }
  ```

- `PATCH /v1/data/:shortId` - Update existing page
  ```json
  {
    "title": "Updated Title",
    "source": "Updated content",
    "createdBy": "username"
  }
  ```

- `GET /v1/data/:shortId` - Get current page data

### History
- `POST /v1/data/:shortId/history` - Get revision history
- `POST /v1/data/:shortId/revision/:revisionNumber` - Get specific revision

## Database Schema

### indexdata
- Current state of wiki pages
- Tracks latest content and revision count
- Auto-incrementing revision count via triggers

### revisiondata
- Historical revisions of pages
- Immutable audit trail
- Foreign key relationship to indexdata

## Development Tips

1. Use `wrangler tail` to view real-time logs
2. Test locally with `wrangler dev --local`
3. Use D1 console for database queries: `wrangler d1 execute`

## Migration from PostgreSQL

This project was migrated from PostgreSQL/Docker to Cloudflare Workers. Key changes include:
- PostgreSQL to D1 (SQLite)
- Node.js/Bun runtime to Cloudflare Workers runtime
- Docker deployment to Wrangler deployment
- bcrypt to Web Crypto API (password features removed)

## License

MIT