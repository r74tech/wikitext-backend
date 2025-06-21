# Wikitext Backend

A modern Wikitext Previewer API built with Hono, PostgreSQL, Docker, and Bun runtime. This project provides a RESTful API for creating, updating, and managing wiki pages with full revision history tracking.

## Features

- 📝 Create and update wiki pages
- 📚 Full revision history tracking
- 🔄 Automatic revision counting
- 🐳 Docker and Docker Compose setup
- 🗄️ PostgreSQL database with migrations
- 🛡️ Type-safe SQL with Kysely (no raw SQL!)
- 🚀 Bun runtime for better performance
- 📦 Distroless Docker image (~100MB)
- 🔒 Optional password protection (future feature)
- 🌐 CORS support for web applications

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Bun 1.0+ (for local development) - [Install Bun](https://bun.sh)
- PostgreSQL (if not using Docker)
- Node.js 18+ (optional, for compatibility)

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd wikitext-backend
```

2. Quick start with Make:
```bash
make quick-start
```

This will:
- Copy `.env.example` to `.env`
- Start all Docker services
- Run database migrations
- Make the API available at `http://localhost:3000`

#### Alternative manual setup:
```bash
cp .env.example .env
docker compose up -d
docker compose run --rm migrate
```

### Local Development

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run database migrations:
```bash
bun run migrate:up
```

4. Start the development server:
```bash
bun run dev
```

## API Endpoints

### Health Check
```
GET /v1/health
```

### Create Page
```
POST /v1/data
Body: {
  "title": "Page Title",
  "source": "Wiki content",
  "createdBy": "username"
}
```

### Update Page
```
PATCH /v1/data/:shortId
Body: {
  "title": "Updated Title",
  "source": "Updated content",
  "createdBy": "username"
}
```

### Get Page
```
GET /v1/data/:shortId
```

### Get Page History
```
POST /v1/data/:shortId/history
```

### Get Specific Revision
```
POST /v1/data/:shortId/revision/:revisionId
```

## Development

### Project Structure
```
wikitext-backend/
├── src/
│   ├── config/         # Configuration files
│   ├── db/            # Database connection and queries
│   ├── models/        # TypeScript interfaces
│   ├── utils/         # Utility functions
│   └── index.ts       # Main application entry
├── db/
│   └── migrations/    # SQL migration files
├── compose.yml # Docker Compose configuration
├── Dockerfile        # Docker image definition
└── package.json      # Node.js dependencies
```

### Available Scripts

#### Make Commands (Recommended)
Run `make help` to see all available commands. Common ones include:

- `make dev` - Start development server locally
- `make up` - Start all Docker services
- `make down` - Stop all services
- `make logs` - View application logs
- `make migrate` - Run database migrations
- `make db-shell` - Access PostgreSQL shell
- `make shell` - Access application container
- `make status` - Check status of all services

#### Bun Scripts
- `bun run dev` - Start development server with hot reload
- `bun run build` - Build TypeScript to JavaScript
- `bun start` - Start production server
- `bun run migrate:up` - Run pending migrations
- `bun run migrate:status` - Check migration status
- `bun run typecheck` - Run TypeScript type checking

### Database Migrations

Create a new migration:
```bash
# Create a new SQL file in db/migrations/
# Name format: 00X_description.sql
```

Run migrations:
```bash
bun run migrate:up
```

Check migration status:
```bash
bun run migrate:status
```

## Docker

### Build and Run

```bash
# Build the image
docker build -t wikitext-backend .

# Run with docker compose
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

### Managing the Database

```bash
# Access PostgreSQL
docker compose exec postgres psql -U wikitext

# Run migrations
docker compose run --rm migrate

# Access pgAdmin (if enabled)
# Visit http://localhost:5050
```

## Environment Variables

See `.env.example` for all available environment variables:

- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ORIGINS` - Allowed CORS origins
- `NODE_ENV` - Environment (development/production)

## Future Features

- 🌐 Wikidot integration using [scp-jp-utilities](https://github.com/ukwhatn/scp-jp-utilities)
- 🔧 FTML parsing via WebAssembly API
- 🔐 Enhanced authentication and authorization
- 🔄 Real-time collaboration features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.