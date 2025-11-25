/**
 * Common test constants and utilities.
 *
 * Provides shared constants used across multiple test suites to maintain
 * consistency and avoid magic values.
 */
export const TestConstants = {
	/** Non-existent UUID for 404 tests */
	NON_EXISTENT_UUID: "550e8400-e29b-41d4-a716-446655440000",

	/** Invalid UUID format for validation tests */
	INVALID_UUID: "not-a-valid-uuid",

	/** Invalid CPF (incorrect checksum) */
	INVALID_CPF: "123.456.789-00",

	/** Invalid CNPJ (incorrect checksum) */
	INVALID_CNPJ: "11.222.333/0001-00",
} as const;
