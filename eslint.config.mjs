import eslintPluginNestJs from "@darraghor/eslint-plugin-nestjs-typed";
import { defineConfig } from "@eslint/config-helpers";
import eslintJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	eslintPluginUnicorn.configs.recommended,
	{
		ignores: [
			"**/node_modules/**",
			"**/out/**",
			"**/dist/**",
			"**/build/**",
			"**/*.tsbuildinfo",
			"**/migrations/**",
			".turbo/**",
			"prettier.config.mjs",
			"eslint.config.mjs",
			"reset.d.ts",
			"**/*.db",
			"**/*.db-*",
			"**/logs/**",
			"**/*.log",
			"**/.env*",
			"**/coverage/**",
		],
	},
	{
		files: ["**/*.{js,cjs,mjs,ts,mts,cts,d.ts}"],
		plugins: {
			"@typescript-eslint": tseslint.plugin,
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
			...eslintJs.configs.recommended.rules,

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
			"@typescript-eslint/array-type": ["error", { default: "generic" }],
			"@typescript-eslint/no-extraneous-class": ["error", { allowWithDecorator: true }],

			/* Unicorn */
			"unicorn/no-null": "off",
			"unicorn/prevent-abbreviations": "off",
			"unicorn/prefer-spread": "off",
			"unicorn/no-useless-spread": "error",
		},
	},
	{
		files: ["apps/api/**/*.{js,ts,mts,cts}"],
		plugins: {
			"@darraghor/nestjs-typed": eslintPluginNestJs.plugin,
		},
		extends: [eslintPluginNestJs.configs.flatRecommended],
		rules: {
			"@darraghor/nestjs-typed/injectable-should-be-provided": "off",
		},
	},
	{
		files: [
			"**/*.spec.*",
			"**/*.e2e-spec.*",
			"**/*.test.*",
			"**/*.e2e-test.*",
			"**/tests/**",
			"**/test/**",
		],
		languageOptions: {
			globals: {
				jest: "readonly",
				describe: "readonly",
				it: "readonly",
				expect: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
				beforeAll: "readonly",
				afterAll: "readonly",
			},
		},
		rules: {
			// Disable strict type checking for test files where mocks and expect matchers are common
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/unbound-method": "off",
			"@typescript-eslint/no-misused-spread": "off",
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
