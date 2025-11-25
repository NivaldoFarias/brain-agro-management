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
		],
	},
	{
		files: ["**/*.{js,cjs,mjs,ts,mts,cts}"],
		plugins: {
			"@typescript-eslint": tseslint.plugin,
		},
		languageOptions: {
			globals: {
				...globals.node,
				Bun: "readonly",
				NodeJS: "readonly",
				jest: "readonly",
				describe: "readonly",
				it: "readonly",
				expect: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
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

			/* Unicorn */
			"unicorn/no-null": "off",
			"unicorn/prevent-abbreviations": "off",
		},
	},
	eslintPluginNestJs.configs.flatRecommended,
	{
		files: ["*.spec.*", "*.test.*", "**/tests/**", "**/test/**"],
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
