import { defineConfig } from "@eslint/config-helpers";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unicornPlugin from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
	{
		ignores: [
			"**/node_modules/**",
			"**/out/**",
			"**/dist/**",
			"**/build/**",
			"**/*.tsbuildinfo",
			".turbo/**",
			"prettier.config.mjs",
			"eslint.config.mjs",
		],
	},
	{
		files: ["**/*.{js,cjs,mjs,ts,mts,cts}"],
		plugins: {
			"@typescript-eslint": tseslint.plugin,
			"import": importPlugin,
			"unicorn": unicornPlugin,
		},
		languageOptions: {
			globals: {
				...globals.node,
				Bun: "readonly",
				NodeJS: "readonly",
			},
			parser: tseslint.parser,
			parserOptions: {
				project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
				tsconfigRootDir: import.meta.dirname,
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		rules: {
			...eslint.configs.recommended.rules,

			/* ESLint Core */
			"no-unused-vars": "off",
			"no-console": "error",

			/* TypeScript */
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/explicit-function-return-type": [
				"error",
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
				},
			],
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-floating-promises": "error",

			/* Import Plugin */
			"import/order": [
				"error",
				{
					"groups": [
						"builtin",
						"external",
						"internal",
						["parent", "sibling"],
						"index",
						"object",
						"type",
					],
					"newlines-between": "always",
					"alphabetize": { order: "asc", caseInsensitive: true },
				},
			],
			"import/no-duplicates": "error",
			"import/no-unresolved": "off", // TypeScript handles this

			/* Unicorn Plugin - Selected useful rules */
			"unicorn/better-regex": "error",
			"unicorn/catch-error-name": "error",
			"unicorn/consistent-function-scoping": "error",
			"unicorn/error-message": "error",
			"unicorn/no-array-for-each": "error",
			"unicorn/no-null": "off", // We use null in some cases
			"unicorn/prefer-module": "error",
			"unicorn/prefer-node-protocol": "error",
			"unicorn/prefer-top-level-await": "error",
			"unicorn/throw-new-error": "error",
		},
	},
	{
		files: ["scripts/**/*.{js,ts}", "src/build.ts", "src/scripts/**/*.{js,ts}"],
		rules: {
			"no-console": "off",
		},
	},
	{
		files: ["*.cjs"],
		languageOptions: {
			globals: globals.commonjs,
		},
	},
	{
		files: ["*.mjs"],
		languageOptions: {
			globals: globals.node,
		},
	},
	eslintConfigPrettier,
);
