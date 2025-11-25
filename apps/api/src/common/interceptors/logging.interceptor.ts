import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import type { Request, Response } from "express";

import { correlationIdStorage } from "./correlation-id.interceptor";

/**
 * Intercepts HTTP requests to log request and response details for observability.
 *
 * Logs incoming requests with method, URL, query params, headers, and sanitized body.
 * Logs outgoing responses with status code, duration, and response size.
 * Automatically excludes health check endpoints from logging to reduce noise.
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * providers: [
 *   {
 *     provide: APP_INTERCEPTOR,
 *     useClass: LoggingInterceptor,
 *   },
 * ]
 * ```
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	/**
	 * List of sensitive field names to exclude from request body logging.
	 *
	 * Prevents logging passwords, tokens, and other sensitive data.
	 */
	private readonly sensitiveFields = ["password", "token", "authorization", "secret", "apiKey"];

	/**
	 * List of URL patterns to exclude from logging.
	 *
	 * Reduces log noise by skipping health check endpoints.
	 */
	private readonly excludedPaths = ["/api/health", "/api/health/ready", "/api/metrics"];

	constructor(private readonly logger: PinoLogger) {
		this.logger.setContext(LoggingInterceptor.name);
	}

	/**
	 * Intercepts incoming requests to log request/response details.
	 *
	 * @param context - ExecutionContext providing access to request/response
	 * @param next - CallHandler to proceed with request handling
	 *
	 * @returns Observable that completes when request handling finishes
	 */
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();

		// Skip logging for excluded paths
		if (this.excludedPaths.some((path) => request.url.startsWith(path))) {
			return next.handle();
		}

		const startTime = Date.now();
		const correlationId = correlationIdStorage.getStore();

		// Log incoming request
		this.logRequest(request, correlationId);

		return next.handle().pipe(
			tap({
				next: (data) => {
					this.logResponse(request, response, startTime, correlationId, data);
				},
				error: (error: Error) => {
					this.logError(request, response, startTime, correlationId, error);
				},
			}),
		);
	}

	/**
	 * Logs incoming HTTP request details.
	 *
	 * @param request - Express request object
	 * @param correlationId - Correlation ID for request tracking
	 */
	private logRequest(request: Request, correlationId: string | undefined): void {
		const { method, url, query, headers, body } = request;

		this.logger.info({
			msg: "Incoming request",
			correlationId,
			http: {
				method,
				url,
				query,
				userAgent: headers["user-agent"],
				ip: this.getClientIp(request),
				body: this.sanitizeBody(body),
			},
		});
	}

	/**
	 * Logs successful HTTP response details.
	 *
	 * @param request - Express request object
	 * @param response - Express response object
	 * @param startTime - Request start timestamp
	 * @param correlationId - Correlation ID for request tracking
	 * @param data - Response data
	 */
	private logResponse(
		request: Request,
		response: Response,
		startTime: number,
		correlationId: string | undefined,
		data: unknown,
	): void {
		const duration = Date.now() - startTime;
		const { method, url } = request;
		const { statusCode } = response;

		// Calculate response size (approximate)
		const responseSize = data ? JSON.stringify(data).length : 0;

		this.logger.info({
			msg: "Outgoing response",
			correlationId,
			http: {
				method,
				url,
				statusCode,
				duration,
				responseSize,
			},
		});
	}

	/**
	 * Logs HTTP request error details.
	 *
	 * @param request - Express request object
	 * @param response - Express response object
	 * @param startTime - Request start timestamp
	 * @param correlationId - Correlation ID for request tracking
	 * @param error - Error that occurred during request handling
	 */
	private logError(
		request: Request,
		response: Response,
		startTime: number,
		correlationId: string | undefined,
		error: Error,
	): void {
		const duration = Date.now() - startTime;
		const { method, url } = request;
		const { statusCode } = response;

		this.logger.error({
			msg: "Request failed",
			correlationId,
			http: {
				method,
				url,
				statusCode,
				duration,
			},
			error: {
				name: error.name,
				message: error.message,
				stack: error.stack,
			},
		});
	}

	/**
	 * Sanitizes request body by removing sensitive fields.
	 *
	 * @param body - Request body object
	 *
	 * @returns Sanitized body with sensitive fields masked
	 */
	private sanitizeBody(body: unknown): unknown {
		if (!body || typeof body !== "object") {
			return body;
		}

		const sanitized = { ...body } as Record<string, unknown>;

		for (const field of this.sensitiveFields) {
			if (field in sanitized) {
				sanitized[field] = "***REDACTED***";
			}
		}

		return sanitized;
	}

	/**
	 * Extracts client IP address from request headers or connection.
	 *
	 * Checks common proxy headers (X-Forwarded-For, X-Real-IP) before
	 * falling back to direct connection IP.
	 *
	 * @param request - Express request object
	 *
	 * @returns Client IP address
	 */
	private getClientIp(request: Request): string {
		const forwardedFor = request.headers["x-forwarded-for"];
		if (forwardedFor) {
			const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
			return ips?.split(",")[0]?.trim() ?? "unknown";
		}

		const realIp = request.headers["x-real-ip"];
		if (realIp) {
			return Array.isArray(realIp) ? (realIp[0] ?? "unknown") : realIp;
		}

		return request.socket.remoteAddress ?? "unknown";
	}
}
