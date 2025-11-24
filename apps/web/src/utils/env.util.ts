import { createEnv, LogLevel, RuntimeEnvironment } from "@agro/shared/utils";
import { z } from "zod";

import { environmentDefaults } from "./constants.util";

/**
 * Web application environment schema.
 *
 * Defines and validates all environment variables required for the web application.
 */
const webEnvSchema = z.object({
	/** Node.js runtime environment */
	NODE_ENV: z.enum(RuntimeEnvironment).default(environmentDefaults.NODE_ENV),

	/** Logging level for the application */
	LOG_LEVEL: z.enum(LogLevel).default(environmentDefaults.LOG_LEVEL),

	/** Whether to enable console logging */
	LOG_TO_CONSOLE: z.stringbool().default(environmentDefaults.LOG_TO_CONSOLE),

	/** API base URL for backend requests */
	VITE_API_BASE_URL: z.url().default(environmentDefaults.VITE_API_BASE_URL),

	/** Enable React DevTools in production (for debugging) */
	VITE_ENABLE_DEVTOOLS: z.stringbool().default(environmentDefaults.VITE_ENABLE_DEVTOOLS),
});

/** Type-safe environment variables for the web application */
export type WebEnv = z.infer<typeof webEnvSchema>;

/** Validated environment configuration for the web app */
export const env = createEnv(webEnvSchema);
