# Wikitext Backend - Cloudflare Workers Makefile
.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# === Development ===
.PHONY: dev
dev: ## Start development server (staging environment)
	wrangler dev --env stg

.PHONY: dev-prd
dev-prd: ## Start development server (production config)
	wrangler dev --env prd

.PHONY: install
install: ## Install dependencies
	npm install

.PHONY: typecheck
typecheck: ## Run type checking
	npx tsc --noEmit

# === Database ===
.PHONY: db-create-stg
db-create-stg: ## Create staging database
	wrangler d1 create wikitext-db-stg

.PHONY: db-create-prd
db-create-prd: ## Create production database
	wrangler d1 create wikitext-db-prd

.PHONY: db-migrate-local
db-migrate-local: ## Run migrations on local database
	wrangler d1 migrations apply wikitext-db-local --local

.PHONY: db-migrate-stg
db-migrate-stg: ## Run migrations on staging database
	wrangler d1 migrations apply wikitext-db-stg --env stg

.PHONY: db-migrate-prd
db-migrate-prd: ## Run migrations on production database
	wrangler d1 migrations apply wikitext-db-prd --env prd

.PHONY: db-execute-stg
db-execute-stg: ## Execute SQL on staging database
	@echo "Usage: make db-execute-stg SQL='SELECT * FROM indexdata'"
	wrangler d1 execute wikitext-db-stg --env stg --command="$(SQL)"

.PHONY: db-execute-prd
db-execute-prd: ## Execute SQL on production database
	@echo "Usage: make db-execute-prd SQL='SELECT * FROM indexdata'"
	wrangler d1 execute wikitext-db-prd --env prd --command="$(SQL)"

# === Deployment ===
.PHONY: deploy-stg
deploy-stg: typecheck ## Deploy to staging environment
	wrangler deploy --env stg

.PHONY: deploy-prd
deploy-prd: typecheck ## Deploy to production environment
	wrangler deploy --env prd

# === Logs ===
.PHONY: logs-stg
logs-stg: ## Tail staging logs
	wrangler tail --env stg

.PHONY: logs-prd
logs-prd: ## Tail production logs
	wrangler tail --env prd

# === WASM Deployment ===
.PHONY: deploy-wasm
deploy-wasm: ## Deploy WASM to GitHub Pages (run in CI)
	@echo "WASM deployment is handled by GitHub Actions"
	@echo "Push to main/develop branch to trigger deployment"

# === Quick Start ===
.PHONY: setup
setup: install ## Initial setup
	@echo "✅ Dependencies installed"
	@echo "📝 Next steps:"
	@echo "  1. Create D1 databases: make db-create-stg && make db-create-prd"
	@echo "  2. Update wrangler.toml with your database IDs"
	@echo "  3. Run migrations: make db-migrate-stg && make db-migrate-prd"
	@echo "  4. Start dev server: make dev"

.PHONY: clean
clean: ## Clean build artifacts
	rm -rf .wrangler dist build

# === Testing ===
.PHONY: test-api
test-api: ## Test API endpoints (requires running dev server)
	@echo "Testing health endpoint..."
	@curl -s http://localhost:8787/v1/health | jq .