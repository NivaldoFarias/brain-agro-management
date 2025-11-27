---
title: Brain Agriculture API
emoji: 🌾
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
app_port: 7860
---

# Brain Agriculture API

Production-ready NestJS backend for managing rural producers and farms in Brazil.

## Features

- 🌾 **Producer Management**: CRUD operations with CPF/CNPJ validation
- 🚜 **Farm Operations**: Farm management with area constraints and crop tracking
- 📊 **Analytics Dashboard**: Metrics by state, crop, and land use
- 🔐 **JWT Authentication**: Secure API access
- 📚 **OpenAPI Documentation**: Interactive API reference

## Tech Stack

- **Runtime**: Bun 1.3.3
- **Framework**: NestJS + TypeORM
- **Database**: SQLite (ephemeral - resets on Space restart)
- **Validation**: Zod + class-validator
- **Docs**: Swagger + Scalar

## API Endpoints

Once the Space is running:

- **Health Check**: `/api/health`
- **API Documentation**: `/reference`
- **Swagger UI**: `/api/docs`

## Database

This Space uses **ephemeral SQLite** storage. Data persists during uptime but resets on Space restart (~24h or on code updates).

For persistent storage, either:
1. Upgrade to [Persistent Storage](https://huggingface.co/docs/hub/spaces-storage) ($7/mo)
2. Connect to external PostgreSQL (Neon, Railway, Render)

## Repository

Full source code: [github.com/NivaldoFarias/brain-agro-management](https://github.com/NivaldoFarias/brain-agro-management)

## Configuration

Set these secrets in Space Settings:

- `API__JWT_SECRET`: Generate with `openssl rand -base64 32`
- `API__CORS_ORIGIN`: Your frontend domain or `*`
- `API__PORT`: `7860`
- `NODE_ENV`: `production`

## License

MIT
