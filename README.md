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
[![API Health](https://img.shields.io/website?url=https%3A%2F%2Fbadivia-brain-ag-api.hf.space%2Fapi%2Fhealth%2Fready&label=API%20Status&up_message=healthy&down_message=down)](https://badivia-brain-ag-api.hf.space/api/health/ready)
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
[Architecture](./docs/ARCHITECTURE.md) • 
[Docker Guide](./docs/DOCKER.md)

</div>

---

> [!IMPORTANT]
> **English Version**: [README.en.md](./docs/README.en.md)

**Sistema full-stack para gestão de produtores rurais e fazendas no Brasil.** Desenvolvido como PoC (Prova de Conceito) utilizando Bun, NestJS, React e TypeScript.

## Table of Contents

- [Sobre o Projeto](#sobre-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Quick Start](#quick-start)
- [Status](#status)
- [Documentação](#documentação)
- [Notas de Design](#notas-de-design)

## Sobre o Projeto

Um monorepo pronto para produção que demonstra arquitetura limpa, segurança de tipos (type safety) e práticas de testes. Gerencia operações CRUD para produtores e fazendas, incluindo validação de documentos brasileiros (CPF/CNPJ), regras de área e dashboards analíticos.

### Principais Funcionalidades

- ✅ Gestão completa de produtores rurais
- ✅ Operações CRUD de fazendas e culturas
- ✅ Rastreamento por localização (estados e cidades)
- ✅ Dashboard analítico com métricas de:
  - Total de fazendas por estado
  - Distribuição por cultura
  - Uso do solo (área agricultável vs vegetação)
- ✅ Autenticação JWT com refresh tokens
- ✅ Validação de documentos brasileiros (CPF/CNPJ)
- ✅ Validação de regras de área das fazendas
- ✅ Documentação OpenAPI (Swagger + Scalar)

### Tecnologias

| Categoria         | Tecnologias                        |
| ----------------- | ---------------------------------- |
| **Runtime**       | Bun 1.3+                           |
| **Backend**       | NestJS 10+ • TypeORM 0.3+ • SQLite |
| **Frontend**      | React 18 • Redux Toolkit • Vite 6  |
| **UI Components** | Radix UI • Styled Components       |
| **Validação**     | Zod • class-validator              |
| **Testes**        | Vitest • React Testing Library     |
| **Code Quality**  | TypeScript 5.9 • ESLint • Prettier |
  
## Estrutura do Projeto

```
brain-ag/
├── apps/
│   ├── api/          # NestJS + TypeORM backend
│   └── web/          # React + Redux Toolkit frontend
├── packages/
│   └── shared/       # Tipos, validadores, utilitários compartilhados
├── docs/             # Design do sistema e especificações
└── .github/          # CI/CD workflows e padrões de código
```

> [!TIP]
> Consulte [MONOREPO.md](./docs/MONOREPO.md) para detalhes completos sobre a organização do workspace.

## Quick Start

### Pré-requisitos

- **Bun 1.3+** ([instalar](https://bun.sh/docs/installation))

### Instalação e Execução

```bash
# Instalar dependências
bun install

# Iniciar API + frontend em modo desenvolvimento
bun run dev

# Ou iniciar individualmente
bun run dev:api    # Backend em localhost:3000
bun run dev:web    # Frontend em localhost:5173

# Executar testes
bun test           # Todos os testes
bun run test:api   # Apenas backend
bun run test:web   # Apenas frontend
```

### URLs de Desenvolvimento

| Serviço          | URL                                | Descrição               |
| ---------------- | ---------------------------------- | ----------------------- |
| **Backend API**  | `http://localhost:3000/api`        | Endpoints REST          |
| **Swagger Docs** | `http://localhost:3000/api/docs`   | Documentação interativa |
| **Health Check** | `http://localhost:3000/api/health` | Status da API           |
| **Frontend**     | `http://localhost:5173`            | Interface React         |

### Comandos Úteis

```bash
bun run build        # Build de produção
bun run lint         # Executar linter
bun run lint:fix     # Auto-corrigir problemas de lint
bun run format       # Formatar código com Prettier
bun run type-check   # Verificar tipos TypeScript
```

> [!TIP]
> Consulte [`package.json`](./package.json) para visualizar a lista completa de scripts disponíveis.

## Status

### Implementedado

- **Backend API**: CRUD completo para produtores e fazendas com validação
- **Autenticação**: Sistema JWT com refresh tokens
- **Banco de Dados**: TypeORM + SQLite nativo do Bun com migrations
- **Validação**: Validadores CPF/CNPJ e restrições de área das fazendas
- **Documentação**: OpenAPI (Swagger + Scalar) com exemplos abrangentes
- **Logging**: Logs estruturados com Pino e IDs de correlação
- **CI/CD**: Pipeline automatizado com GitHub Actions
- **Deploy**: API em produção no HuggingFace Spaces
- **Frontend**: Interfaces CRUD completas com React + Redux Toolkit
- **Componentes UI**: Sistema de design baseado em Radix UI (30+ componentes)
- **Formulários**: react-hook-form + validação Zod para todos os inputs
- **Internacionalização**: i18next com suporte a Português e Inglês

### 🚧 Em Progresso

- **Gráficos do Dashboard**: Recharts instalado, componentes pendentes de implementação
- **Suite de Testes**: Infraestrutura pronta, arquivos de teste pendentes
- **Páginas de Edição**: Formulários prontos, carregamento de dados pendente
- **Testes E2E**: Configuração do Cypress/Playwright pendente

> [!TIP]
> Consulte [ROADMAP.md](./docs/ROADMAP.md) para a lista detalhada de tarefas e prioridades.

## Documentação

### Arquitetura & Design

| Documento                                       | Descrição                                           |
| ----------------------------------------------- | --------------------------------------------------- |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md)       | Diagramas C4, padrões arquiteturais, fluxo de dados |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | ERD e especificações das entidades                  |
| [MONOREPO.md](./docs/MONOREPO.md)               | Estrutura e organização do workspace                |

### Configuração & Operação

| Documento                                                               | Descrição                                       |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| [ENVIRONMENT.md](./docs/ENVIRONMENT.md)                                 | Variáveis de ambiente e configuração            |
| [DOCKER.md](./docs/DOCKER.md)                                           | Guia de containerização e deploy                |
| [MONITORING.md](./docs/MONITORING.md)                                   | Monitoramento, alertas e recuperação automática |
| [Swagger UI](https://badivia-brain-ag-api.hf.space/api/docs)            | Documentação interativa da API (OpenAPI)        |
| [Scalar Reference](https://badivia-brain-ag-api.hf.space/api/reference) | Referência moderna da API                       |

### Desenvolvimento

Padrões de código e guias de estilo em `.github/instructions/`:
- **Backend**: NestJS, TypeORM, padrões de serviço
- **Frontend**: React, Redux Toolkit, Radix UI
- **Database**: Migrations, seeds, padrões TypeORM
- **Testing**: Unit tests, integration tests, TDD
- **TypeScript**: Strict mode, type safety, JSDoc

## Notas de Design

- **Bun**: Suporte nativo a TypeScript, instalações mais rápidas, bundler integrado. Escolhido em vez do `node` pela performance e DX.
- **SQLite**: Zero configuração para dev/avaliação. Em produção, migraria para PostgreSQL (o TypeORM abstrai essa mudança).
- **Redux Toolkit + RTK Query**: Reduz o boilerplate em ~60%. Caching integrado, estados de carregamento, atualizações otimistas.
- **Radix UI**: Primitivos acessíveis (WAI-ARIA) com controle total de estilização. Base para WCAG 2.1 AA.
- **Monorepo**: Tipos compartilhados garantem consistência de contrato na API. Instalação única, ferramentas unificadas.
