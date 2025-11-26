#!/usr/bin/env bun

/**
 * Build script for the NestJS API using Bun bundler.
 *
 * Bundles the NestJS application into a single executable file for production deployment.
 * Handles TypeORM decorators, reflection metadata, and native dependencies properly.
 *
 * @see https://bun.sh/docs/bundler for Bun bundler documentation
 */
import { rm } from "node:fs/promises";
import { join } from "node:path";

const ROOT_DIR = import.meta.dir;
const DIST_DIR = join(ROOT_DIR, "dist");
const ENTRY_POINT = join(ROOT_DIR, "src", "main.ts");

/**
 * Clean the dist directory before building.
 */
async function cleanDist(): Promise<void> {
	try {
		await rm(DIST_DIR, { recursive: true, force: true });
		console.log("✓ Cleaned dist directory");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			throw error;
		}
	}
}

/**
 * Bundle the NestJS application using Bun's bundler.
 */
async function buildApp(): Promise<void> {
	console.log("Building API bundle...");

	const result = await Bun.build({
		entrypoints: [ENTRY_POINT],
		outdir: DIST_DIR,
		target: "bun",
		format: "esm",
		splitting: false,
		sourcemap: "linked",
		minify: false,
		// Bundle workspace dependencies (@agro/shared), keep node_modules external
		external: [
			"@nestjs/*",
			"typeorm",
			"rxjs",
			"reflect-metadata",
			"passport*",
			"helmet",
			"pino*",
			"nestjs-pino",
			"class-*",
			"@scalar/*",
			"@fnando/*",
			"zod",
		],
		naming: {
			entry: "[name].js",
			chunk: "[name]-[hash].js",
			asset: "[name]-[hash].[ext]",
		},
	});

	if (!result.success) {
		console.error("❌ Build failed with errors:");
		for (const log of result.logs) {
			console.error(log);
		}
		process.exit(1);
	}

	if (result.logs.length > 0) {
		console.warn("⚠️ Build completed with warnings:");
		for (const log of result.logs) {
			console.warn(log);
		}
	}

	console.log("✓ Build completed successfully!");
	console.log(`  Output: ${DIST_DIR}/main.js`);

	for (const output of result.outputs) {
		const sizeInKB = (output.size / 1024).toFixed(2);
		console.log(`  - ${output.path} (${sizeInKB} KB)`);
	}
}

/**
 * Main build process.
 */
async function build(): Promise<void> {
	try {
		await cleanDist();
		await buildApp();
		console.log("\n✓ Build process completed successfully!");
	} catch (error) {
		console.error("\n❌ Build process failed:");
		console.error(error);
		process.exit(1);
	}
}

if (import.meta.main) {
	await build();
}
