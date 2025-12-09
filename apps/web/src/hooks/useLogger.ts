import { useMemo } from "react";

import { Logger } from "@/utils/logger.util";

/**
 * Attempts to auto-detect the calling component's name from the call stack.
 *
 * Parses the JavaScript Error stack trace to extract the function name
 * from the calling context. This provides automatic context for logger
 * instances without requiring explicit naming.
 *
 * @returns The detected component/function name, or `undefined` if detection fails
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const name = detectCallerContext();
 *   console.log(name); // "MyComponent"
 * }
 * ```
 */
function detectCallerContext(): string | undefined {
	try {
		const error = new Error();
		const stackLines = error.stack?.split("\n");

		if (!stackLines || stackLines.length < 3) {
			return undefined;
		}

		const callerLine = stackLines[2];
		if (!callerLine) {
			return undefined;
		}

		const regex = /at (\w+)/;
		const match = regex.exec(callerLine);
		const componentName = match?.[1];

		if (componentName && componentName !== "useLogger" && componentName !== "detectCallerContext") {
			return componentName;
		}

		return undefined;
	} catch {
		return undefined;
	}
}

/**
 * React hook that provides a logger instance with automatic context detection.
 *
 * Automatically derives context from the calling component's name using
 * stack trace parsing. For explicit control or when auto-detection fails,
 * pass a custom context string.
 *
 * @param customContext Optional explicit context name (overrides auto-detection)
 *
 * @returns Logger instance with appropriate context
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const logger = useLogger();
 *   // Context automatically set to "UserProfile"
 *
 *   useEffect(() => {
 *     logger.info("Component mounted");
 *   }, []);
 * }
 *
 * // With explicit context
 * function MyComponent() {
 *   const logger = useLogger("CustomContext");
 *   logger.debug("Using custom context");
 * }
 * ```
 */
export function useLogger(customContext?: string): Logger {
	return useMemo(() => {
		return new Logger({ context: customContext ?? detectCallerContext() });
	}, [customContext]);
}
