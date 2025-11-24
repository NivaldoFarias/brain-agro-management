# Agro Management - Monorepo Structure

This project uses a monorepo structure with Bun workspaces and TypeScript project references.

## Structure

```
agro-management/
├── apps/
│   ├── api/                 # Backend REST API (Bun + TypeScript)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                 # Frontend React app (Vite + TypeScript)
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/              # Shared code (types, utils, validators)
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── package.json             # Root workspace configuration
├── tsconfig.json            # TypeScript project references
└── tsconfig.base.json       # Base TypeScript configuration
```

## Workspaces

This monorepo contains three workspaces:

### `@agro/api`

Backend REST API handling:

- Producer CRUD operations
- Farm management
- Dashboard aggregations
- Business logic validation

### `@agro/web`

Frontend React application with:

- Producer and farm forms
- Dashboard with charts
- Atomic design components
- Redux state management

### `@agro/shared`

Shared package containing:

- Common types and interfaces
- Utility functions
- Validators (CPF, CNPJ, farm area)
- Business logic shared between frontend and backend

## Development

### Install Dependencies

```bash
bun install
```

### Run Development Servers

```bash
# Run all apps
bun run dev

# Run specific app
bun run dev:api
bun run dev:web
```

### Build

```bash
# Build all apps
bun run build

# Build specific app
bun run build:api
bun run build:web
```

### Testing

```bash
# Run all tests
bun test

# Run tests for specific workspace
bun run test:api
bun run test:web
```

### Type Checking

```bash
bun run type-check
```

### Linting & Formatting

```bash
bun run lint
bun run lint:fix
bun run format
```

## Workspace Dependencies

Workspaces can depend on each other using the `workspace:*` protocol:

```json
{
	"dependencies": {
		"@agro/shared": "workspace:*"
	}
}
```

This creates a symlink to the local package, enabling:

- Fast iteration without publishing
- Type-safe imports with TypeScript project references
- Shared code reuse across apps

## TypeScript Project References

The root `tsconfig.json` references all workspace projects, enabling:

- Incremental builds
- Fast type checking
- Cross-project navigation in IDEs

Each workspace extends `tsconfig.base.json` for consistent compiler options.

## Adding a New Workspace

1. Create directory in `apps/` or `packages/`
2. Add `package.json` with `@agro/*` name
3. Add `tsconfig.json` extending `tsconfig.base.json`
4. Add reference to root `tsconfig.json`
5. Run `bun install` to link workspace

## Useful Commands

```bash
# Add dependency to specific workspace
bun add <package> --filter @agro/api

# Remove workspace node_modules
bun run clean

# Check workspace setup
bun pm ls
```
