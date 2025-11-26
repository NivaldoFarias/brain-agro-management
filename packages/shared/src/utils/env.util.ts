import type { z } from "zod";

/**
 * Creates a type-safe environment validator for a given Zod schema.
 *
 * This factory function enables each workspace to define its own environment
 * schema while sharing the validation logic.
 *
 * @param schema Zod schema defining the environment variables
 * @param source Environment source (defaults to `import.meta.env`)
 * @returns Validated and typed environment object
 *
 * @throws {Error} Detailed validation errors if environment variables are invalid
 *
 * @example
 * ```typescript
 * const envSchema = z.object({
 *   PORT: z.coerce.number().default(3000),
 *   DATABASE_URL: z.string().url(),
 * });
 *
 * export const env = createEnv(envSchema);
 * ```
 */
export function createEnv<T extends z.ZodObject<z.ZodRawShape>>(
	schema: T,
	source: Record<string, unknown> = import.meta.env,
): z.infer<T> {
	const result = schema.safeParse(source);

	if (!result.success) {
		const issues = result.error.issues
			.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
			.join("\n");
		throw new Error(`❌ Invalid environment variables:\n${issues}`);
	}

	return result.data;
}
