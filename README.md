# Backend Template

NestJS backend project template. HTTP kernel is **Fastify** (`@nestjs/platform-fastify`), not Express — use Fastify plugins and types (`NestFastifyApplication`, `app.register(...)`) in `src/main.ts`. Compression (`@fastify/compress`) and cookies (`@fastify/cookie`) are already registered.

## Scripts

```bash
npm run start:dev    # Development with hot reload
npm run start:prod   # Production
npm run build        # Build
npm run lint         # Lint & fix
npm run test         # Unit tests
npm run test:e2e     # E2E tests
```

## Project Structure

```
src/
├── core/
│   ├── config/      # App configuration (env variables)
│   ├── database/    # Drizzle + PostgreSQL connection
│   ├── health/      # Health check endpoints
│   └── app/         # Root module
├── database/        # SQL migrations
├── modules/         # Feature modules
└── main.ts          # Entry point
```

## Database

PostgreSQL is accessed through [Drizzle ORM](https://orm.drizzle.team) (`drizzle-orm` 0.45, node-postgres driver) and the official `@nestjs/drizzle` module.

- **Local Postgres:** `docker compose up -d` (image and credentials from `.env` / `.env.example`)
- **Connection:** `DatabaseModule` (`src/core/database`) registers one pool for the whole app; it is closed on shutdown
- **Usage:** inject the database with `@InjectDrizzle() private readonly db: Database` (`Database` from `@/core/database/database.types`)
- **Health:** `GET /health` runs `select 1` when `HEALTH_CHECK_ENABLED=true` and answers **503** if the database is unavailable
- **Schema and migrations:** coming next (drizzle-kit, SQL migrations in `src/database/migrations/`)

## Libraries

| Purpose       | Library                  |
|---------------|--------------------------|
| HTTP          | Fastify (`@nestjs/platform-fastify`) |
| Validation    | Joi                      |
| ORM           | Drizzle (`drizzle-orm`, `@nestjs/drizzle`) |
| Database      | PostgreSQL (`pg`)        |

## Core Modules

| Purpose       | Module           |
|---------------|-----------------|
| Configuration | `ConfigModule`  |
| Database      | `DatabaseModule` |
| Health Check  | `HealthModule`  |

## Adding a Module

```bash
nest generate module <name>
nest generate controller <name>
nest generate service <name>
```

## Code Style

- Use `@` aliases for imports (e.g., `@config/config.service`)
- Run `npm run format` before committing
- Follow NestJS module pattern
