# Environment Configuration Guide

## Structure

This monorepo uses a **single root `.env` file** approach for all workspaces.

```
agro-management/
├── .env                    # ✅ Single source of truth
├── .env.example            # Template with all variables
├── apps/
│   ├── api/
│   │   └── src/config/
│   │       └── env.ts      # Validates API-specific variables
│   └── web/
│       └── src/config/
│           └── env.ts      # Validates Web-specific variables
└── packages/shared/
    └── src/utils/
        └── env.util.ts     # Reusable validation factory
```

## How It Works

### 1. Root `.env` File

All environment variables for all workspaces are defined in a single root `.env` file.

**Naming Convention:**

- **Shared variables**: No prefix (e.g., `NODE_ENV`)
- **API variables**: `API__` prefix (double underscore, e.g., `API__PORT`, `API__DATABASE_PATH`)
- **Web variables**: `WEB__VITE_` prefix (Vite convention for build-time vars)

```bash
# Shared (no prefix) - Used by multiple apps
NODE_ENV=development

# API-specific (API__* prefix with double underscore)
API__PORT=3000
API__DATABASE_PATH=./apps/api/data/agro.db
API__BASE_PATH=/api
API__LOG_LEVEL=info
API__LOG_TO_CONSOLE=true
API__JWT_SECRET=your-secret-key-min-32-chars

# Web-specific (WEB__VITE_* prefix for build-time variables)
WEB__VITE_API_BASE_URL=http://localhost:3000/api
WEB__VITE_ENABLE_DEVTOOLS=false
```

### 2. Workspace-Specific Schemas

Each app validates only the variables it needs:

**API** (`apps/api/src/config/env.config.ts`):

```typescript
const apiEnvSchema = z.object({
	NODE_ENV: z.nativeEnum(RuntimeEnvironment), // Shared
	API__LOG_LEVEL: z.nativeEnum(LogLevel), // API-specific
	API__PORT: z.coerce.number(), // API-specific
	API__DATABASE_PATH: z.string(), // API-specific
	// ... more API-specific variables
});
```

**Web** (`apps/web/src/utils/env.util.ts`):

```typescript
const webEnvSchema = z.object({
	NODE_ENV: z.nativeEnum(RuntimeEnvironment),
	WEB__VITE_API_BASE_URL: z.string().url(),
	// ... Web-specific variables
});
```

### 3. Usage in Apps

**API**:

```typescript
import { env } from "@/config/env.config";
import { logger } from "@/config/logger.config";

logger.info({ port: env.API__PORT }, "Starting server");
// env is fully typed with API-specific variables
```

**Web**:

```typescript
import { env } from "@/utils/env.util";

const apiClient = createClient(env.WEB__VITE_API_BASE_URL);
// env is fully typed with Web-specific variables
```

## Benefits

✅ **Single Source of Truth**: One file to manage all variables  
✅ **Type Safety**: Each app gets its own typed environment  
✅ **No Duplication**: Shared variables defined once  
✅ **Clear Separation**: Each schema validates only what it needs  
✅ **Easy Deployment**: One `.env` file to configure

## Setup

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Configure required variables:

   ```bash
   # Required for API
   API__JWT_SECRET=your-very-secure-secret-key-minimum-32-characters
   API__DATABASE_PATH=./apps/api/data/agro.db

   # Optional: Override defaults
   API__PORT=4000
   API__LOG_LEVEL=debug
   ```

3. Start development:
   ```bash
   bun run dev
   ```

## Environment Sources

Bun/Node.js automatically reads from:

1. `.env` file in the root directory
2. `process.env` system environment variables
3. Command-line environment variables

Priority (highest to lowest):

```bash
# 1. Command-line (highest priority)
PORT=4000 bun run dev:api

# 2. System environment
export PORT=4000

# 3. .env file (lowest priority)
PORT=4000
```

## Validation

Each workspace validates its environment on startup:

- ✅ Missing required variables throw errors with clear messages
- ✅ Invalid types are caught immediately
- ✅ Default values are applied automatically

Example error:

```
❌ Invalid environment variables:
- DATABASE_URL: Required
- PORT: Expected number, received string
```
