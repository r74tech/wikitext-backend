# Wikitext Backend Makefile
.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# === Development ===
.PHONY: dev
dev: ## Start development server locally
	bun run dev

.PHONY: install
install: ## Install dependencies
	bun install

.PHONY: build
build: ## Build TypeScript
	bun run build

.PHONY: typecheck
typecheck: ## Run type checking
	bun run typecheck

# === Docker ===
.PHONY: up
up: ## Start all services
	docker compose up -d

.PHONY: down
down: ## Stop all services
	docker compose down

.PHONY: restart
restart: ## Restart all services
	docker compose restart

.PHONY: logs
logs: ## View app logs
	docker compose logs -f app

.PHONY: ps
ps: ## Show running containers
	docker compose ps

# === Database ===
.PHONY: migrate
migrate: ## Run database migrations
	docker compose run --rm migrate

.PHONY: db-shell
db-shell: ## Access PostgreSQL shell
	docker compose exec postgres psql -U ftml ftml

.PHONY: db-backup
db-backup: ## Backup database
	@mkdir -p db/backup
	@docker compose exec -T postgres pg_dump -U ftml ftml > db/backup/backup_$$(date +%Y%m%d_%H%M%S).sql

# === Quick Start ===
.PHONY: setup
setup: install up migrate ## Setup and start everything
	@echo "✅ Application ready at http://localhost:8300"

.PHONY: clean
clean: down ## Clean up containers and volumes
	docker compose down -v

.PHONY: rebuild
rebuild: ## Rebuild containers
	docker compose build --no-cache
	docker compose up -d