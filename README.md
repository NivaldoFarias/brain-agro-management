# Agro Management

> **Full-stack rural producer and farm management system**

Technical assessment project demonstrating modern full-stack development practices with TypeScript, Bun, React, and PostgreSQL.

## Overview

Agro Management is a comprehensive platform for managing rural producers, farms, and agricultural data. The system provides CRUD operations, business logic validation, and real-time dashboard analytics for agricultural operations.

### Key Features

- 🌾 **Producer Management**: Complete CRUD for rural producers with CPF/CNPJ validation
- 🚜 **Farm Operations**: Multi-farm management with area validation and crop tracking
- 📊 **Dashboard Analytics**: Real-time statistics and visualizations (farms by state, crop distribution, land use)
- ✅ **Business Rules**: Automated validation for farm areas, document formats, and relationships
- 🔒 **Type Safety**: End-to-end TypeScript with strict mode and comprehensive types

## Tech Stack

### Backend

- **Runtime**: Bun (Node.js replacement)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **API**: REST with OpenAPI specification
- **Logging**: Pino (structured JSON logs)
- **Testing**: Bun test runner

### Frontend

- **Framework**: React 18+
- **Build Tool**: Vite
- **State Management**: Redux Toolkit + Context API
- **Styling**: Styled Components (CSS-in-JS)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library + Cypress

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Monorepo**: Bun workspaces + TypeScript project references
- **CI/CD**: GitLab CI / GitHub Actions
- **Deployment**: AWS (Lambda, ECS, RDS, S3)

## Project Structure

```
agro-management/
├── apps/
│   ├── api/          # Backend REST API
│   └── web/          # Frontend React app
├── packages/
│   └── shared/       # Shared types, utils, validators
└── docs/             # Documentation
```

## Quick Start

```bash
# Install dependencies
bun install

# Run development servers
bun run dev

# Run API only
bun run dev:api

# Run frontend only
bun run dev:web

# Run tests
bun test

# Type check
bun run type-check

# Build for production
bun run build
```

## Documentation

- [Monorepo Structure](./docs/MONOREPO.md) - Workspace configuration and development workflow

## Requirements

- **Bun**: v1.0.0+ (as Node.js/npm replacement)
- **Docker**: v20.0.0+ (for PostgreSQL)
- **PostgreSQL**: v15+

## License

MIT
