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
> **🚀 Implantação em Produção**  
> **API Backend**: [https://badivia-brain-ag-api.hf.space](https://badivia-brain-ag-api.hf.space)  
> **API Frontend**: [https://brain-agro-management-web.vercel.app](https://brain-agro-management-web.vercel.app)  
> **Documentação da API**: [/api/reference](https://badivia-brain-ag-api.hf.space/api/reference) • [/api/docs](https://badivia-brain-ag-api.hf.space/api/docs)  
> **Status de Saúde**: [/api/health](https://badivia-brain-ag-api.hf.space/api/health)  
> **Implantação**: Hugging Face Spaces (Docker) com CI/CD automatizado via git push

Sistema full-stack para gestão de produtores rurais e fazendas no Brasil. Construído como avaliação técnica com Bun, NestJS, React e TypeScript.

## O que é este projeto

Um monorepo pronto para produção demonstrando arquitetura limpa, segurança de tipos e práticas de teste. Gerencia operações CRUD para produtores e fazendas com validação de documentos brasileiros (CPF/CNPJ), restrições de área e dashboards analíticos.

**Funcionalidades principais**: Gestão de produtores • Operações de fazendas • Rastreamento de culturas • Dashboard com métricas de estado/cultura/uso-do-solo • Autenticação JWT • Documentação OpenAPI

**Tecnologias**: Runtime Bun • NestJS + TypeORM • React 18 + Redux Toolkit • SQLite • Radix UI • Validação Zod

## Estrutura do Projeto

Veja [MONOREPO.md](./docs/MONOREPO.md) para organização detalhada do workspace.

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

## Início Rápido

**Pré-requisitos**: Bun 1.3+ ([instalar](https://bun.sh/docs/installation))

```bash
bun install         # Instalar dependências
bun run dev         # Iniciar API + frontend
bun test            # Executar testes
```

**API rodando em**: `localhost:3000/api` • Docs em `/api/docs` • Health em `/api/health`  
**Frontend rodando em**: `localhost:5173`

Comandos comuns: `dev:api`, `dev:web`, `build`, `lint`, `type-check` — veja `package.json`

## Status do Projeto

Funcionalidades principais do backend e frontend completas. Gráficos do dashboard em andamento.

**Concluído**: CRUD de produtor/fazenda • Validação CPF/CNPJ • Validação de área • Autenticação JWT • Docs da API  
**Pendente**: UI do Dashboard (Recharts) • Testes E2E • Cobertura de testes frontend • Implantação em nuvem

Veja [ROADMAP.md](./docs/ROADMAP.md) para checklist detalhado.

## Documentação

**Arquitetura & Design**:
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Diagramas C4, padrões, fluxo de dados
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) — ERD e especificações de entidades
- [MONOREPO.md](./docs/MONOREPO.md) — Estrutura do workspace

**Configuração**:
- [ENVIRONMENT.md](./docs/ENVIRONMENT.md) — Variáveis de ambiente
- [Swagger UI](http://localhost:3000/api/docs) — Documentação interativa da API (requer servidor rodando)
- [Scalar Reference](http://localhost:3000/api/reference) — Referência moderna da API

**Desenvolvimento**: Veja `.github/instructions/` para padrões de código (backend, frontend, banco de dados, testes, TypeScript)

## Notas de Design

- **Bun**: Suporte nativo a TypeScript, instalações mais rápidas, bundler integrado. Escolhido no lugar de `sqlite` para compatibilidade.
- **SQLite**: Zero configuração para dev/avaliação. Migraria para PostgreSQL em produção (TypeORM abstrai isso).
- **Redux Toolkit + RTK Query**: Reduz boilerplate ~60%. Caching integrado, estados de carregamento, atualizações otimistas.
- **Radix UI**: Primitivos acessíveis (WAI-ARIA) com controle total de estilização. Baseline WCAG 2.1 AA.
- **Monorepo**: Tipos compartilhados garantem consistência do contrato da API. Instalação única, ferramentas unificadas.

## Credenciais de Teste

Para testar a aplicação em produção:

```
Email: admin@example.com
Senha: admin123
```

## Licença

MIT
