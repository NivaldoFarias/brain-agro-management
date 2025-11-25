import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";

/**
 * Storage for correlation ID throughout the request lifecycle.
 *
 * Uses AsyncLocalStorage to maintain request-scoped context without
 * explicit parameter passing through the call chain.
 */
export const correlationIdStorage = new AsyncLocalStorage<string>();

/**
 * Intercepts HTTP requests to inject correlation IDs for distributed tracing.
 *
 * Generates or extracts correlation ID from request headers, stores it in
 * AsyncLocalStorage for access throughout the request lifecycle, and adds
 * it to response headers for client tracking.
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * providers: [
 *   {
 *     provide: APP_INTERCEPTOR,
 *     useClass: CorrelationIdInterceptor,
 *   },
 * ]
 * ```
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
	/**
	 * Intercepts incoming requests to manage correlation IDs.
	 *
	 * @param context - ExecutionContext providing access to request/response
	 * @param next - CallHandler to proceed with request handling
	 *
	 * @returns Observable that completes when request handling finishes
	 */
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest() as Record<string, unknown> & {
			headers: Record<string, string>;
		};
		const response = context.switchToHttp().getResponse() as Record<string, unknown> & {
			setHeader(key: string, value: string): void;
		};

		const correlationId = request.headers["x-correlation-id"] || randomUUID();

		return new Observable((subscriber) => {
			correlationIdStorage.run(correlationId, () => {
				response.setHeader("X-Correlation-ID", correlationId);

				next
					.handle()
					.pipe(
						tap({
							next: (value) => {
								subscriber.next(value);
							},
							error: (error) => {
								subscriber.error(error);
							},
							complete: () => {
								subscriber.complete();
							},
						}),
					)
					.subscribe();
			});
		});
	}
}
