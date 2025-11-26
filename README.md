# Brain Agriculture Assessment

Full-stack system for managing rural producers and farms in Brazil. Built as a technical assessment with Bun, NestJS, React, and TypeScript.

## What This Is

A production-ready monorepo demonstrating clean architecture, type safety, and testing practices. Handles CRUD operations for producers and farms with Brazilian document validation (CPF/CNPJ), area constraints, and analytics dashboards.

**Core features**: Producer management • Farm operations • Crop tracking • Dashboard with state/crop/land-use metrics • JWT authentication • OpenAPI documentation

**Tech**: Bun runtime • NestJS + TypeORM • React 18 + Redux Toolkit • SQLite • Radix UI • Zod validation

## Project Structure

See [MONOREPO.md](./docs/MONOREPO.md) for detailed workspace organization.

```
brain-ag/
├── apps/
│   ├── api/          # NestJS + TypeORM (see docs/ARCHITECTURE.md)
│   └── web/          # React + Redux Toolkit
├── packages/
│   └── shared/       # Types, validators, utils
└── docs/             # System design and specs
```

**Stack**: Bun • NestJS • TypeORM • React 18 • Redux Toolkit • Radix UI • SQLite

## Quick Start

**Prerequisites**: Bun 1.3+ ([install](https://bun.sh/docs/installation))

```bash
bun install         # Install dependencies
bun run dev         # Start API + frontend
bun test            # Run tests
```

**API runs on**: `localhost:3333/api` • Docs at `/api/docs` • Health at `/health`  
**Frontend runs on**: `localhost:5173`

Common commands: `dev:api`, `dev:web`, `build`, `lint`, `type-check` — see `package.json`

## Status

Backend and frontend core features complete. Dashboard charts in progress.

**Done**: Producer/farm CRUD • CPF/CNPJ validation • Area validation • JWT auth • API docs  
**Pending**: Dashboard UI (Recharts) • E2E tests • Frontend test coverage • Cloud deployment

See [ROADMAP.md](./docs/ROADMAP.md) for detailed checklist.

## Documentation

**Architecture & Design**:
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — C4 diagrams, patterns, data flow
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) — ERD and entity specs
- [MONOREPO.md](./docs/MONOREPO.md) — Workspace structure

**Configuration**:
- [ENVIRONMENT.md](./docs/ENVIRONMENT.md) — Environment variables
- [Swagger UI](http://localhost:3333/api/docs) — Interactive API docs (requires running server)
- [Scalar Reference](http://localhost:3333/reference) — Modern API reference

**Development**: See `.github/instructions/` for coding standards (backend, frontend, database, testing, TypeScript)

## Design Notes

- **Bun**: Native TypeScript support, faster installs, built-in bundler. Chose over `sqlite` for compatibility.
- **SQLite**: Zero-config for dev/assessment. Would migrate to PostgreSQL in production (TypeORM abstracts this).
- **Redux Toolkit + RTK Query**: Reduces boilerplate ~60%. Built-in caching, loading states, optimistic updates.
- **Radix UI**: Accessible primitives (WAI-ARIA) with full styling control. WCAG 2.1 AA baseline.
- **Monorepo**: Shared types ensure API contract consistency. Single install, unified tooling.
