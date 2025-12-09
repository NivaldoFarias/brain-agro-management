# VS Code Debugging Setup

This workspace is configured for debugging both the API (NestJS) and Web (React) applications using Bun runtime with VS Code's JavaScript Debug Terminal.

> **Note**: These configurations use `node-terminal` type which leverages VS Code's JavaScript Debug Terminal. This provides better Bun compatibility than the standard Node.js debugger.

## Available Debug Configurations

### API (Server) Debugging

#### 1. [Server] Debug API [Recommended]
- **Use Case**: Primary development debugging with hot reload
- **Type**: `node-terminal` (JavaScript Debug Terminal)
- **Command**: `cd apps/api && bun --inspect --watch src/main.ts`
- **Features**:
  - Auto-attaches debugger using VS Code's JS Debug Terminal
  - Auto-reloads on file changes
  - Breakpoints work reliably
  - Full source map support
- **Port**: 6499 (Bun's default debug port)

#### 2. [Server] Debug API (No Watch)
- **Use Case**: Focused debugging without auto-reload
- **Command**: `cd apps/api && bun --inspect src/main.ts`
- **Features**:
  - Manual restart required
  - Cleaner for step-by-step debugging

#### 3. [Server] Debug API (Break on Start)
- **Use Case**: Debug initialization code or first-line issues
- **Command**: `cd apps/api && bun --inspect-brk src/main.ts`
- **Features**:
  - Breaks at the very first line of code
  - Useful for debugging startup issues

#### 4. [Server] Debug API via Workspace Script
- **Use Case**: Debug using root-level workspace script
- **Command**: `bun run dev:api`
- **Features**:
  - Uses monorepo workspace scripts
  - Automatically adds `--inspect` flag via JS Debug Terminal

#### 5. [Server] Attach to Running API
- **Use Case**: Attach to already running Bun process
- **Type**: `node` (attach mode)
- **Requirements**: Start server manually with `bun --inspect src/main.ts`
- **Port**: 6499

#### 6. [Server] Debug API Tests
- **Use Case**: Debug backend test files
- **Command**: `cd apps/api && bun --inspect test`
- **Features**: Step through test execution with breakpoints

### Web (Client) Debugging

#### 7. [Client] Debug Web
- **Use Case**: Debug React application in Chrome
- **Type**: `chrome`
- **URL**: http://localhost:5173
- **Features**:
  - Launches Chrome with DevTools auto-opened
  - Full source map support for TypeScript
  - Automatically starts Vite dev server
- **Requirements**: Pre-launch task starts Vite server

#### 8. [Client] Debug Web via Workspace Script
- **Use Case**: Debug React app using workspace script
- **Type**: `node-terminal`
- **Command**: `bun run dev:web`
- **Features**: Uses monorepo workspace scripts

#### 9. [Client] Debug Web Tests
- **Use Case**: Debug frontend test files
- **Command**: `cd apps/web && bun --inspect test`
- **Features**: Step through Vitest tests with breakpoints

### Full Stack Debugging

#### 10. Debug Full Stack [Compound]
- **Use Case**: Debug both API and Web simultaneously
- **Configurations**: Runs "[Server] Debug API" + "[Client] Debug Web"
- **Features**:
  - Both debuggers in parallel
  - `stopAll: true` stops both when either stops
  - Perfect for debugging full-stack features

#### 11. Debug Full Stack (Workspace Scripts) [Compound]
- **Use Case**: Debug full stack using workspace scripts
- **Configurations**: Runs "[Server] Debug API via Workspace Script" + "[Client] Debug Web via Workspace Script"
- **Features**: Same as above but using root-level scripts

## Debug Flags Explained

Bun supports three debug flags:

- **`--inspect`**: Starts debugger, code runs immediately (recommended with `node-terminal` type)
- **`--inspect-wait`**: Starts debugger, waits for debugger to attach before running
- **`--inspect-brk`**: Starts debugger, breaks at first line of code

Default port: **6499**

Custom port: `bun --inspect=4000 src/main.ts`

## Why `node-terminal` Type?

The `node-terminal` configuration type uses VS Code's **JavaScript Debug Terminal**, which:
- Auto-detects and instruments any Node.js/Bun process with debugging
- More reliable than `attachSimplePort` for Bun's WebSocket protocol
- Preserves all terminal features (colors, interactivity)
- Automatically handles reconnections on file changes (with `--watch`)
- Works seamlessly with Bun's inspect flags

## Usage Instructions

### Quick Start
1. Open the file you want to debug
2. Set breakpoints by clicking left of line numbers (red dot appears)
3. Press `F5` or go to Run & Debug panel (Ctrl+Shift+D / Cmd+Shift+D)
4. Select the appropriate configuration from dropdown
5. Start debugging

### Debugging Tips

#### API Debugging
- Use **[Server] Debug API** for everyday development
- Use **[Server] Debug API (Break on Start)** for startup issues
- Use **[Server] Attach to Running API** when server is already running
- If a config doesn't work, try the "via Workspace Script" variant

#### Web Debugging
- Chrome DevTools will auto-open with source maps
- React DevTools extension recommended
- Redux DevTools automatically available in dev mode

#### Test Debugging
- Set breakpoints in test files
- Use `[Server] Debug API Tests` or `[Client] Debug Web Tests`
- Step through assertions and test logic
- Tests use `--inspect` (not `--inspect-wait`) so they run immediately

### Keyboard Shortcuts
- `F5`: Start debugging
- `F9`: Toggle breakpoint
- `F10`: Step over
- `F11`: Step into
- `Shift+F11`: Step out
- `Shift+F5`: Stop debugging
- `Ctrl+Shift+F5`: Restart debugging

## Troubleshooting

### Port Already in Use
If port 6499 is already in use:
```bash
# Find process using port 6499
lsof -ti:6499

# Kill the process
kill -9 $(lsof -ti:6499)
```

### Debugger Not Attaching
1. Check if Bun is installed: `bun --version`
2. Verify VS Code can find Bun: Check terminal PATH
3. Make sure no other debug session is using port 6499
4. Try "[Server] Attach to Running API" after manually starting server with `bun --inspect src/main.ts`
5. Check if JavaScript Debug Terminal is available (should be built-in to VS Code)

### Source Maps Not Working
- Ensure `tsconfig.json` has `"sourceMap": true`
- Check `resolveSourceMapLocations` in launch.json
- Restart VS Code if source maps were just enabled

### Web Debugger Not Starting
- Ensure Vite dev server isn't already running
- Check if port 5173 is available
- Manually run `bun run dev:web` to test Vite server

## Alternative: Bun Web Debugger

VS Code extension support for Bun is currently experimental. For a more stable experience, use Bun's web debugger:

```bash
# Start with inspect flag
cd apps/api
bun --inspect src/main.ts

# Open browser to URL shown in terminal
# Example: https://debug.bun.sh/#localhost:6499/xxx
```

The web debugger provides a WebKit Inspector interface with:
- Full source debugging
- Console access
- Breakpoint management
- Network inspection

## References

- [Bun Debugger Documentation](https://bun.sh/docs/runtime/debugger)
- [Bun VS Code Debugging Guide](https://bun.sh/docs/guides/runtime/vscode-debugger)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
