---
title: Brain Agriculture API
emoji: 🌾
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
app_port: 7860
---

# Brain Agriculture - Avaliação Técnica

> **🌐 English Version**: [README.en.md](./docs/README.en.md)

> [!IMPORTANT]
> **🚀 Deploy em Produção (Live)**  
> **URL base da API Backend**: [https://badivia-brain-ag-api.hf.space](https://badivia-brain-ag-api.hf.space/api)  
> **Documentação Interativa da API**: [/api/reference](https://badivia-brain-ag-api.hf.space/api/reference) • [/api/docs](https://badivia-brain-ag-api.hf.space/api/docs)  
> **Documentação API Swagger**: [/api/docs](https://badivia-brain-ag-api.hf.space/api/docs)  
> **Health Check**: [/api/health](https://badivia-brain-ag-api.hf.space/api/health)  
> **Deploy**: Hugging Face Spaces (Docker) com CD

Sistema full-stack para gestão de produtores rurais e fazendas no Brasil. Desenvolvido como uma avaliação técnica utilizando Bun, NestJS, React e TypeScript.

## Sobre o Projeto

Um monorepo pronto para produção que demonstra arquitetura limpa, segurança de tipos (type safety) e práticas de testes. Gerencia operações CRUD para produtores e fazendas, incluindo validação de documentos brasileiros (CPF/CNPJ), regras de área e dashboards analíticos.

**Principais Funcionalidades**: Gestão de produtores • Operações de fazendas • Rastreamento de culturas • Dashboard com métricas por estado/cultura/uso do solo • Autenticação JWT • Documentação OpenAPI

**Tecnologias**: Runtime Bun • NestJS + TypeORM • React 18 + Redux Toolkit • SQLite • Radix UI • Validação com Zod

## Estrutura do Projeto

Consulte [MONOREPO.md](./docs/MONOREPO.md) para detalhes sobre a organização do workspace.

```
brain-ag/
├── apps/
│   ├── api/          # NestJS + TypeORM (veja docs/ARCHITECTURE.md)
│   └── web/          # React + Redux Toolkit
├── packages/
│   └── shared/       # Tipos, validadores, utilitários
└── docs/             # Design do sistema e especificações
```

**Stack**: Bun • NestJS • TypeORM • React 18 • Redux Toolkit • Radix UI • SQLite

## Quick Start

**Pré-requisitos**: Bun 1.3+ ([instalar](https://bun.sh/docs/installation))

```bash
bun install         # Instalar dependências
bun run dev         # Iniciar API + frontend
bun test            # Executar testes
```

**API rodando em**: `localhost:3333/api` • Docs em `/api/docs` • Health em `/health`  
**Frontend rodando em**: `localhost:5173`

Comandos comuns: `dev:api`, `dev:web`, `build`, `lint`, `type-check` — veja `package.json`

## Status

Funcionalidades principais do backend e frontend concluídas. Gráficos do dashboard em andamento.

**Concluído**: CRUD de Produtor/Fazenda • Validação de CPF/CNPJ • Validação de Área • Autenticação JWT • Docs da API  
**Pendente**: UI do Dashboard (Recharts) • Testes E2E • Cobertura de testes no Frontend • Implantação na Nuvem

Veja [ROADMAP.md](./docs/ROADMAP.md) para o checklist detalhado.

## Documentação

**Arquitetura & Design**:
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Diagramas C4, padrões, fluxo de dados
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) — ERD e especificações das entidades
- [MONOREPO.md](./docs/MONOREPO.md) — Estrutura do workspace

**Configuração & Operação**:
- [ENVIRONMENT.md](./docs/ENVIRONMENT.md) — Variáveis de ambiente
- [DOCKER.md](./docs/DOCKER.md) — Guia de deploy com Docker
- [MONITORING.md](./docs/MONITORING.md) — Monitoramento, alertas e recuperação automática
- [Swagger UI](http://localhost:3333/api/docs) — Documentação interativa da API (requer servidor rodando)
- [Scalar Reference](http://localhost:3333/reference) — Referência moderna da API

**Desenvolvimento**: Veja `.github/instructions/` para padrões de código (backend, frontend, banco de dados, testes, TypeScript)

## Notas de Design

- **Bun**: Suporte nativo a TypeScript, instalações mais rápidas, bundler integrado. Escolhido em vez do `node` pela performance e DX.
- **SQLite**: Zero configuração para dev/avaliação. Em produção, migraria para PostgreSQL (o TypeORM abstrai essa mudança).
- **Redux Toolkit + RTK Query**: Reduz o boilerplate em ~60%. Caching integrado, estados de carregamento, atualizações otimistas.
- **Radix UI**: Primitivos acessíveis (WAI-ARIA) com controle total de estilização. Base para WCAG 2.1 AA.
- **Monorepo**: Tipos compartilhados garantem consistência de contrato na API. Instalação única, ferramentas unificadas.
