# Code Quality & CI/CD Strategy

This document outlines our code quality approach: separate tools for separate concerns, enabling fast feedback and clear error isolation.

## Core Philosophy

We use **focused, independent tools** rather than combining everything into one slow process:

| Tool           | Purpose                       | Speed    | When to Run         |
| -------------- | ----------------------------- | -------- | ------------------- |
| **ESLint**     | Code patterns, best practices | ~5-10s   | Pre-commit, CI, IDE |
| **Prettier**   | Code formatting               | ~2s      | Pre-commit, CI, IDE |
| **TypeScript** | Type safety, compilation      | ~10-20s  | CI, Pre-push, IDE   |
| **Tests**      | Runtime behavior              | Variable | CI, Pre-push        |

### Why Separate Tools?

- **Speed**: Independent execution is faster than combined analysis
- **Clarity**: Each tool reports specific issue types
- **Flexibility**: Run quick checks during development, comprehensive checks before pushing

## Development Commands

### Quick Checks (Pre-Commit)
```bash
bun run lint:fix        # Auto-fix linting issues
bun run format          # Auto-format code
```

### Comprehensive Checks (Pre-Push)
```bash
bun run type-check      # Full type safety verification
bun test                # All unit and integration tests
```

### Combined Pre-Push Check
```bash
bun run lint && bun run format:check && bun run type-check && bun test
```

## CI/CD Pipeline

The pipeline runs two parallel jobs for fast feedback:

### Job 1: Code Quality
- ESLint (code patterns)
- Prettier (formatting)
- TypeScript (type safety)

### Job 2: Tests
- Unit and integration tests

**Configuration**: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

### Understanding CI Failures

| Failure           | Cause                   | Fix                      |
| ----------------- | ----------------------- | ------------------------ |
| **Linting**       | Code pattern violation  | `bun run lint:fix`       |
| **Formatting**    | Inconsistent formatting | `bun run format`         |
| **Type-checking** | Type safety issue       | Fix reported type errors |
| **Tests**         | Runtime behavior issue  | Debug failing tests      |

## IDE Setup (VS Code)

**Required extensions**:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

**Recommended settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Tool Responsibilities

### ESLint
Checks **code patterns and style** (not type safety):
- Code quality rules
- Best practice patterns
- Style consistency

### TypeScript
Run `bun run type-check` to verify:
- Type safety and inference
- Compilation errors
- Import/export resolution

### Rule Variations

| Aspect        | API (NestJS)             | Web (React)              |
| ------------- | ------------------------ | ------------------------ |
| Arrays        | `Array<T>`               | `T[]`                    |
| Special Rules | NestJS patterns          | React Hooks, a11y        |
| Test Files    | Relaxed typing for mocks | Relaxed typing for mocks |

## Best Practices

### Developer Workflow
1. **Before committing**: `bun run lint:fix` and `bun run format`
2. **Before pushing**: `bun run type-check` and `bun test`
3. **Use IDE integration**: Real-time feedback prevents issues
4. **Fix CI failures**: All checks must pass before merging

### Code Review Checklist
- ✅ CI status is green
- ✅ No unnecessary rule disables or `@ts-expect-error`
- ✅ Type safety maintained (avoid `any` types)
- ✅ New code has tests

## Troubleshooting

| Issue                               | Solution                                                 |
| ----------------------------------- | -------------------------------------------------------- |
| **ESLint slow in IDE**              | Reload VS Code: `Cmd/Ctrl + Shift + P` → "Reload Window" |
| **Type-check fails, ESLint passes** | Expected—run `bun run type-check` and fix type errors    |
| **Formatting fails in CI only**     | Run `bun run format` locally and commit changes          |
| **CI taking too long**              | Check CI logs for cache hits and dependency issues       |

## Quick Reference

| ✅ DO                                      | ❌ DON'T                             |
| ----------------------------------------- | ----------------------------------- |
| Run `bun run lint:fix` before committing  | Commit code with linting errors     |
| Run `bun run type-check` before pushing   | Skip type-checking for "speed"      |
| Use IDE extensions for real-time feedback | Ignore CI failures                  |
| Write tests for new features              | Disable rules without justification |

## Resources

- [ESLint Docs](https://eslint.org/docs/latest/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prettier Docs](https://prettier.io/docs/en/)
