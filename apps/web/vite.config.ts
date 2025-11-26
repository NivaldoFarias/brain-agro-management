import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/**
 * Vite configuration for Brain Agriculture frontend application.
 *
 * Configures build tooling, dev server, path aliases, and optimizations
 * for production-ready React application with TypeScript support.
 *
 * @see {@link https://vite.dev/config/|Vite Configuration Reference}
 */
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, import.meta.dirname, "");

	return {
		plugins: [react()],

		resolve: {
			alias: {
				"@": path.resolve(import.meta.dirname, "./src"),
				"@agro/shared": path.resolve(import.meta.dirname, "../../packages/shared/src"),
			},
		},

		server: {
			port: Number.parseInt(env["WEB__PORT"] ?? "5173", 10),
			host: env["WEB__HOST"] ?? "localhost",
			strictPort: true,
			open: false,
			proxy: {
				"/api": {
					target: env["WEB__VITE_API_BASE_URL"] ?? "http://localhost:3000",
					changeOrigin: true,
					secure: false,
					rewrite: (path) => path.replace(/^\/api/, "/api"),
				},
			},
		},

		preview: {
			port: Number.parseInt(env["WEB__PREVIEW_PORT"] ?? "4173", 10),
			host: env["WEB__HOST"] ?? "localhost",
			strictPort: true,
		},

		build: {
			outDir: "dist",
			sourcemap: mode === "development",
			minify: mode === "production" ? "esbuild" : false,
			target: "esnext",
			rollupOptions: {
				output: {
					manualChunks: {
						"react-vendor": ["react", "react-dom", "react-router-dom"],
						"redux-vendor": ["@reduxjs/toolkit", "react-redux"],
						"ui-vendor": ["styled-components", "recharts"],
					},
				},
			},
			chunkSizeWarningLimit: 1000,
		},

		envPrefix: "WEB__VITE_",

		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: ["./src/test/setup.ts"],
			css: true,
			coverage: {
				provider: "v8",
				reporter: ["text", "json", "html", "lcov"],
				exclude: [
					"node_modules/",
					"src/test/",
					"**/*.d.ts",
					"**/*.config.*",
					"**/dist/**",
					"**/coverage/**",
				],
			},
		},

		optimizeDeps: {
			include: [
				"react",
				"react-dom",
				"react-router-dom",
				"@reduxjs/toolkit",
				"react-redux",
				"styled-components",
				"recharts",
			],
		},
	};
});
