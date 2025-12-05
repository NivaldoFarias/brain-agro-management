import eslintPluginNestJs from "@darraghor/eslint-plugin-nestjs-typed";
import { defineConfig } from "@eslint/config-helpers";
import eslintJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
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
			globals: { ...globals.node },
			parser: tseslint.parser,
			parserOptions: {
				project: [
					"./tsconfig.json",
					"./apps/web/tsconfig.json",
					"./apps/api/tsconfig.json",
					"./packages/shared/tsconfig.json",
				],
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
		},
	},
	{
		files: ["apps/api/**/*.{js,ts,mts,cts}"],
		plugins: {
			"@darraghor/nestjs-typed": eslintPluginNestJs.plugin,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: ["./apps/api/tsconfig.json"],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		extends: [eslintPluginNestJs.configs.flatRecommended],
		rules: {
			"@darraghor/nestjs-typed/injectable-should-be-provided": "off",
		},
	},
	{
		files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
		plugins: {
			"react": eslintPluginReact,
			"react-hooks": eslintPluginReactHooks,
			"jsx-a11y": eslintPluginJsxA11y,
		},
		languageOptions: {
			globals: { ...globals.browser },
			parser: tseslint.parser,
			parserOptions: {
				ecmaFeatures: { jsx: true },
				project: ["./apps/web/tsconfig.json"],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			...eslintPluginReact.configs.recommended.rules,
			...eslintPluginReact.configs["jsx-runtime"].rules,
			...eslintPluginReactHooks.configs.recommended.rules,
			...eslintPluginJsxA11y.configs.recommended.rules,

			/* React */
			"react/prop-types": "off",
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
			"jsx-a11y/anchor-is-valid": "warn",

			/* TypeScript */
			"@typescript-eslint/array-type": ["error", { default: "array" }],
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
			/* Disable strict type linting for test files where mocks and expect matchers are common */
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
