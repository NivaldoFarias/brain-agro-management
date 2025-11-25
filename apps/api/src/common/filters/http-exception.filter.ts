import { ArgumentsHost, Catch, HttpException, HttpStatus } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

import type { ExceptionFilter } from "@nestjs/common";
import type { Request, Response } from "express";

import { correlationIdStorage } from "../interceptors/correlation-id.interceptor";

/**
 * Error response structure returned by the exception filter.
 *
 * Provides consistent error format across all API endpoints.
 */
interface ErrorResponse {
	/** HTTP status code */
	statusCode: number;

	/** Error message or array of validation errors */
	message: string | Array<string>;

	/** Error type/name */
	error: string;

	/** ISO timestamp when error occurred */
	timestamp: string;

	/** Request path where error occurred */
	path: string;

	/** Correlation ID for request tracking */
	correlationId?: string;
}

/**
 * Global exception filter that catches all HTTP exceptions and errors.
 *
 * Provides consistent error response format, includes correlation IDs,
 * and logs errors with full context for debugging. Handles both NestJS
 * HttpExceptions and unexpected runtime errors.
 *
 * @example
 * ```typescript
 * // In main.ts
 * app.useGlobalFilters(new HttpExceptionFilter(logger));
 * ```
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: PinoLogger) {
		this.logger.setContext(HttpExceptionFilter.name);
	}

	/**
	 * Catches and processes all exceptions thrown during request handling.
	 *
	 * @param exception - Exception that was thrown
	 * @param host - ArgumentsHost providing access to request/response
	 */
	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const correlationId = correlationIdStorage.getStore();

		const { statusCode, message, error } = this.parseException(exception);

		const errorResponse: ErrorResponse = {
			statusCode,
			message,
			error,
			timestamp: new Date().toISOString(),
			path: request.url,
			correlationId,
		};

		this.logException(exception, request, correlationId, statusCode);

		response.status(statusCode).json(errorResponse);
	}

	/**
	 * Parses exception to extract status code, message, and error type.
	 *
	 * @param exception - Exception to parse
	 *
	 * @returns Parsed exception details
	 */
	private parseException(exception: unknown): {
		statusCode: number;
		message: string | Array<string>;
		error: string;
	} {
		if (exception instanceof HttpException) {
			const statusCode = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === "object") {
				const response = exceptionResponse as Record<string, unknown>;

				return {
					statusCode,
					message: (response["message"] as string | Array<string>) || exception.message,
					error: (response["error"] as string) || exception.name,
				};
			}

			return {
				statusCode,
				message: exception.message,
				error: exception.name,
			};
		}

		// Handle non-HTTP exceptions (unexpected errors)
		return {
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
			message: "Internal server error",
			error: "InternalServerError",
		};
	}

	/**
	 * Logs exception with full context for debugging.
	 *
	 * @param exception - Exception that was thrown
	 * @param request - Express request object
	 * @param correlationId - Correlation ID for request tracking
	 * @param statusCode - HTTP status code
	 */
	private logException(
		exception: unknown,
		request: Request,
		correlationId: string | undefined,
		statusCode: number,
	): void {
		const { method, url, headers, body, query } = request;

		const logLevel = statusCode >= 500 ? "error" : "warn";

		const logData = {
			msg: "Exception caught",
			correlationId,
			http: {
				method,
				url,
				query,
				statusCode,
				userAgent: headers["user-agent"],
			},
			exception: {
				name: exception instanceof Error ? exception.name : "Unknown",
				message: exception instanceof Error ? exception.message : String(exception),
				stack: exception instanceof Error ? exception.stack : undefined,
			},
			// Include request body for 4xx errors (client errors)
			...(statusCode >= HttpStatus.BAD_REQUEST &&
				statusCode < HttpStatus.INTERNAL_SERVER_ERROR && { requestBody: body }),
		};

		if (logLevel === "error") {
			this.logger.error(logData);
		} else {
			this.logger.warn(logData);
		}
	}
}
