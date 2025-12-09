import type { Params } from "nestjs-pino";
import type { SerializedRequest, SerializedResponse } from "pino";

import { RuntimeEnvironment } from "@agro/shared/enums";

import { correlationIdStorage } from "@/common";
import { env } from "@/config/env.config";

/**
 * Configuration for `nestjs-pino` logger integration.
 *
 * Provides structured JSON logging with correlation ID support via
 * AsyncLocalStorage. Configures different transports for file and console
 * output based on environment.
 *
 * @returns Pino logger configuration parameters for NestJS
 *
 * @see {@link https://github.com/iamolegga/nestjs-pino|`nestjs-pino` Documentation}
 */
export function createPinoConfig(): Params {
	const isProduction = env.NODE_ENV === RuntimeEnvironment.Production;

	return {
		pinoHttp: {
			level: env.API__LOG_LEVEL,
			timestamp: () => `,"time":"${new Date().toISOString()}"`,
			formatters: {
				level: (label) => ({ level: label }),
			},
			customProps: () => ({
				correlationId: correlationIdStorage.getStore(),
			}),
			serializers: {
				req: (req: SerializedRequest) => ({
					id: req.id,
					method: req.method,
					url: req.url,
					correlationId: correlationIdStorage.getStore(),
				}),
				res: (res: SerializedResponse) => ({
					statusCode: res.statusCode,
				}),
			},
			transport:
				isProduction ? undefined : (
					{
						target: "pino-pretty",
						options: {
							colorize: true,
							translateTime: "HH:MM:ss Z",
							ignore: "pid,hostname",
							singleLine: false,
						},
					}
				),
		},
	};
}
