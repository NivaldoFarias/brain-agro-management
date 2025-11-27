---
title: Brain Agriculture API
emoji: 🌾
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
app_port: 7860
---

# Brain Agriculture 🌾

<div align="center">

[![CI Status](https://github.com/NivaldoFarias/brain-agro-management/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NivaldoFarias/brain-agro-management/actions/workflows/ci.yml)
[![API Health](https://img.shields.io/website?url=https%3A%2F%2Fbadivia-brain-ag-api.hf.space%2Fapi%2Fhealth&label=API%20Status&up_message=healthy&down_message=down)](https://badivia-brain-ag-api.hf.space/api/health)
[![HuggingFace](https://img.shields.io/badge/🤗%20HuggingFace-Deployed-yellow)](https://badivia-brain-ag-api.hf.space/api)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.0.1-green.svg)](package.json)

### Tech Stack

[![Bun](https://img.shields.io/badge/Bun-1.3+-000000?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![NestJS](https://img.shields.io/badge/NestJS-11.1-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.5-764ABC?style=flat&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3.27-FE0902?style=flat&logo=typeorm&logoColor=white)](https://typeorm.io)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Zod](https://img.shields.io/badge/Zod-4.1-3E67B1?style=flat&logo=zod&logoColor=white)](https://zod.dev)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Latest-161618?style=flat&logo=radix-ui&logoColor=white)](https://www.radix-ui.com)

### Quick Links

[Live API](https://badivia-brain-ag-api.hf.space/api) • 
[API Docs (Swagger)](https://badivia-brain-ag-api.hf.space/api/docs) • 
[API Reference (Scalar)](https://badivia-brain-ag-api.hf.space/api/reference) • 
[Architecture](./ARCHITECTURE.md) • 
[Docker Guide](./DOCKER.md)

</div>

---

> **Versão em Português**: [README.md](../README.md)

**Full-stack system for managing rural producers and farms in Brazil.** Built as a PoC (Proof of Concept) using Bun, NestJS, React, and TypeScript.

## Table of Contents

- [About the Project](#about-the-project)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Status](#status)
- [Documentation](#documentation)
- [Design Notes](#design-notes)

## About the Project

A production-ready monorepo demonstrating clean architecture, type safety, and testing practices. Manages CRUD operations for producers and farms, including Brazilian document validation (CPF/CNPJ), area rules, and analytics dashboards.

### Key Features

- ✅ Complete rural producer management
- ✅ Farm and crop CRUD operations
- ✅ Location-based tracking (states and cities)
- ✅ Analytics dashboard with metrics for:
  - Total farms by state
  - Distribution by crop
  - Land use (arable area vs vegetation)
- ✅ JWT authentication with refresh tokens
- ✅ Brazilian document validation (CPF/CNPJ)
- ✅ Farm area rules validation
- ✅ OpenAPI documentation (Swagger + Scalar)

### Technologies

| Category          | Technologies                              |
| ----------------- | ----------------------------------------- |
| **Runtime**       | Bun 1.3+                                  |
| **Backend**       | NestJS 11.1 • TypeORM 0.3.27 • SQLite     |
| **Frontend**      | React 18.3 • Redux Toolkit 2.5 • Vite 6.0 |
| **UI Components** | Radix UI • Styled Components              |
| **Validation**    | Zod 4.1 • class-validator                 |
| **Testing**       | Vitest • React Testing Library            |
| **Code Quality**  | TypeScript 5.9 • ESLint • Prettier        |
  
## Project Structure

```
brain-ag/
├── apps/
│   ├── api/          # NestJS + TypeORM backend
│   └── web/          # React + Redux Toolkit frontend
├── packages/
│   └── shared/       # Shared types, validators, utilities
├── docs/             # System design and specifications
└── .github/          # CI/CD workflows and code standards
```

> 📖 See [MONOREPO.md](./MONOREPO.md) for complete details on workspace organization.

## Quick Start

### Prerequisites

- **Bun 1.3+** ([install](https://bun.sh/docs/installation))

### Installation and Execution

```bash
# Install dependencies
bun install

# Start API + frontend in development mode
bun run dev

# Or start individually
bun run dev:api    # Backend at localhost:3000
bun run dev:web    # Frontend at localhost:5173

# Run tests
bun test           # All tests
bun run test:api   # Backend only
bun run test:web   # Frontend only
```

### Development URLs

| Service          | URL                                | Description               |
| ---------------- | ---------------------------------- | ------------------------- |
| **Backend API**  | `http://localhost:3000/api`        | REST endpoints            |
| **Swagger Docs** | `http://localhost:3000/api/docs`   | Interactive documentation |
| **Health Check** | `http://localhost:3000/api/health` | API status                |
| **Frontend**     | `http://localhost:5173`            | React interface           |

### Useful Commands

```bash
bun run build        # Production build
bun run lint         # Run linter
bun run lint:fix     # Auto-fix lint issues
bun run format       # Format code with Prettier
bun run type-check   # Check TypeScript types
```

> 💡 See `package.json` for complete list of available scripts.

## Status

### ✅ Implemented Features

- **Backend API**: Complete CRUD for producers and farms
- **Validation**: CPF/CNPJ and farm area rules
- **Authentication**: JWT system with refresh tokens
- **Documentation**: OpenAPI (Swagger + Scalar)
- **Tests**: Unit test suite on backend
- **CI/CD**: Automated pipeline with GitHub Actions
- **Deploy**: Production on HuggingFace Spaces

### 🚧 In Development

- **Dashboard UI**: Charts and visualizations (Recharts)
- **E2E Tests**: Cypress for end-to-end testing
- **Frontend Coverage**: Expanding React test suite

> 📋 See [ROADMAP.md](./ROADMAP.md) for detailed checklist and complete progress.

## Documentation

### Architecture & Design

| Document                                   | Description                                    |
| ------------------------------------------ | ---------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)       | C4 diagrams, architectural patterns, data flow |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | ERD and entity specifications                  |
| [MONOREPO.md](./MONOREPO.md)               | Workspace structure and organization           |

### Configuration & Operation

| Document                                                                | Description                                |
| ----------------------------------------------------------------------- | ------------------------------------------ |
| [ENVIRONMENT.md](./ENVIRONMENT.md)                                      | Environment variables and configuration    |
| [DOCKER.md](./DOCKER.md)                                                | Containerization and deployment guide      |
| [MONITORING.md](./MONITORING.md)                                        | Monitoring, alerts, and automatic recovery |
| [Swagger UI](https://badivia-brain-ag-api.hf.space/api/docs)            | Interactive API documentation (OpenAPI)    |
| [Scalar Reference](https://badivia-brain-ag-api.hf.space/api/reference) | Modern API reference                       |

### Development

Coding standards and style guides in `.github/instructions/`:
- **Backend**: NestJS, TypeORM, service patterns
- **Frontend**: React, Redux Toolkit, Radix UI
- **Database**: Migrations, seeds, TypeORM patterns
- **Testing**: Unit tests, integration tests, TDD
- **TypeScript**: Strict mode, type safety, JSDoc

## Design Notes

- **Bun**: Native TypeScript support, faster installs, built-in bundler. Chosen over `node` for performance and DX.
- **SQLite**: Zero configuration for dev/assessment. Would migrate to PostgreSQL in production (TypeORM abstracts this change).
- **Redux Toolkit + RTK Query**: Reduces boilerplate by ~60%. Built-in caching, loading states, optimistic updates.
- **Radix UI**: Accessible primitives (WAI-ARIA) with full styling control. WCAG 2.1 AA baseline.
- **Monorepo**: Shared types ensure API contract consistency. Single install, unified tooling.
