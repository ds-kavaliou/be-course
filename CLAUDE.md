# CLAUDE.md

Учебный проект курса «Back End · группа A1»: монолитное HTTP API на NestJS (пользователи, RBAC, трансформации файлов).
Фронтенда нет — все сценарии вызываются из HTTP-клиента.

## Требования

- Требования и теория — в `context/1/*.md`, порядок уроков — `context/1/config.json`.
  Практическая часть каждого урока начинается с заголовка `# Практическое задание`.
- Перед реализацией урока перечитать его контракт (`1.3`), ошибки (`1.4`), аудит (`1.5`) и НФТ (`1.6`).
- Инструменты, отличные от рекомендуемых в курсе, согласуются с ментором — отмечать такие решения явно.

## Как работаем

- Небольшие логические итерации: одна тема за раз, сначала объяснение «что и зачем», затем код, затем как проверить.
- После итерации — остановиться и дождаться реакции. Коммит — только по команде, прямо в `main`, один на итерацию.
- Автор — Angular-разработчик, изучающий бэкенд: объяснять концепции, аналогии с Angular приветствуются.

## Стек и решения

- Node.js **24.20.0** (`.nvmrc`), NestJS 11, HTTP-ядро **Fastify** (не Express): плагины через `app.register(...)`,
  типы `FastifyRequest`/`FastifyReply`; пакеты, работающие только с Express, не подходят.
- PostgreSQL 18. ORM — **Drizzle 0.45.x** + `@nestjs/drizzle` (TypeORM из boilerplate удалён).
  Документация NestJS по Drizzle написана под v1 RC — связи писать в стиле v0 (`relations()`).
  БД внедряется через `@InjectDrizzle()`, тип — `Database` из `@/core/database/database.types`.
- `@nestjs/drizzle` — ESM-only: в Node 24 работает через `require(esm)`, в Jest — транспиляцией через `tsconfig.spec.json`
  и `transformIgnorePatterns`. Новые ESM-only пакеты добавлять туда же.
- Схема БД меняется только миграциями; `synchronize` не используется.
- Конфигурация — `src/core/config` (Joi-схема, fail-fast при старте); новые переменные добавлять в схему, `config.types.ts` и `.env.example`.
- Фоновые задачи — на таблицах Postgres (без Redis/брокеров, требование урока 1.6).
- Наблюдаемость — OpenTelemetry; NestJS Observe не используем.

## Команды

```bash
npm run start:dev   # dev с hot reload
npm run build       # сборка
npm test            # unit-тесты (Jest, *.spec.ts рядом с кодом)
npm run test:e2e    # e2e (test/, пока устарел — переписываем в итерации 2.5)
npm run lint        # ESLint с --fix
npm run format      # Prettier
docker compose up -d  # локальная инфраструктура
```

## Код

- Импорты через алиас `@/` (`@/core/config/config.service`); Jest знает его через `moduleNameMapper`.
- Модули NestJS: `src/core/*` — инфраструктура, `src/modules/*` — фичи. Слои: controller → service → repository.
- Unit-тесты подменяют зависимости через `{ provide: X, useValue: mock }`.
- Перед коммитом: `npm run build`, `npm test`, `npm run lint`.

## MCP

- `context7` (`.mcp.json`) — актуальная документация библиотек; для Drizzle явно указывать версию 0.45.
- `postgres` — Google MCP Toolbox (`--prebuilt=postgres`) под ролью `mcp_readonly`: схема, данные, `EXPLAIN`.
  Требует `docker compose up -d`. Запись запрещена правами роли в БД, а не самим MCP-сервером.
