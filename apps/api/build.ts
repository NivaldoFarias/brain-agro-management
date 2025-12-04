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
import path from "node:path";

import Bun from "bun";

import { LogLevel, RuntimeEnvironment } from "@agro/shared/enums";
import { createLogger } from "@agro/shared/utils";

const ROOT_DIR = import.meta.dir;
const DIST_DIR = path.join(ROOT_DIR, "dist");
const ENTRY_POINT = path.join(ROOT_DIR, "src", "main.ts");

const logger = createLogger({
	name: "build",
	level: LogLevel.Debug,
	environment: RuntimeEnvironment.Build,
	logToConsole: true,
	logsDir: path.join(ROOT_DIR, "logs"),
});

/**
 * Clean the dist directory before building.
 */
async function cleanDist(): Promise<void> {
	try {
		await rm(DIST_DIR, { recursive: true, force: true });

		logger.info("✓ Cleaned dist directory");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			throw error;
		}

		logger.info("✓ Dist directory does not exist, no need to clean");
	}
}

/**
 * Bundles the NestJS application using Bun's bundler.
 *
 * Includes bundling workspace dependencies (`@agro/shared`),
 * whilst keeping `node_modules` external
 */
async function buildApp(): Promise<void> {
	logger.info("Building API bundle...");

	const result = await Bun.build({
		entrypoints: [ENTRY_POINT],
		outdir: DIST_DIR,
		target: "bun",
		format: "esm",
		splitting: false,
		sourcemap: "linked",
		minify: false,
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
		logger.error("❌ Build failed with errors:");
		for (const log of result.logs) {
			logger.error(log);
		}
		process.exit(1);
	}

	if (result.logs.length > 0) {
		logger.warn("⚠️ Build completed with warnings:");
		for (const log of result.logs) {
			logger.warn(log);
		}
	}

	logger.info("✓ Build completed successfully!");
	logger.info(`  Output: ${DIST_DIR}/main.js`);

	for (const output of result.outputs) {
		const sizeInKB = (output.size / 1024).toFixed(2);
		logger.info(`  - ${output.path} (${sizeInKB} KB)`);
	}
}

/**
 * Main build process.
 */
async function build(): Promise<void> {
	try {
		await cleanDist();
		await buildApp();
		logger.info("\n✓ Build process completed successfully!");
	} catch (error) {
		logger.error("\n❌ Build process failed:");
		logger.error(error);
		process.exit(1);
	}
}

if (import.meta.main) {
	await build();
}
