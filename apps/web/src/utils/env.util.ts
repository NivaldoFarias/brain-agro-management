import { z } from "zod";

import { createEnv, LogLevel, RuntimeEnvironment } from "@agro/shared/utils";

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
	WEB__LOG_LEVEL: z.enum(LogLevel).default(environmentDefaults.WEB__LOG_LEVEL),

	/** Whether to enable console logging */
	WEB__LOG_TO_CONSOLE: z.stringbool().default(environmentDefaults.WEB__LOG_TO_CONSOLE),

	/** API base URL for backend requests */
	WEB__VITE_API_BASE_URL: z.url().default(environmentDefaults.WEB__VITE_API_BASE_URL),

	/** Enable React DevTools in production (for debugging) */
	WEB__VITE_ENABLE_DEVTOOLS: z.stringbool().default(environmentDefaults.WEB__VITE_ENABLE_DEVTOOLS),

	/** Port for the web server */
	WEB__PORT: z.coerce.number().int().default(environmentDefaults.WEB__PORT),

	/** Host for the web server */
	WEB__HOST: z.string().default(environmentDefaults.WEB__HOST),

	/** Port for the preview server */
	WEB__PREVIEW_PORT: z.coerce.number().int().default(environmentDefaults.WEB__PREVIEW_PORT),
});

/** Type-safe environment variables for the web application */
export type WebEnv = z.infer<typeof webEnvSchema>;

/** Validated environment configuration for the web app */
export const env = createEnv(webEnvSchema);
