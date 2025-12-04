import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";

import { correlationIdStorage } from "./correlation-id.interceptor";

/** Metadata included in transformed API responses */
interface ResponseMeta {
	/** ISO timestamp when response was generated */
	timestamp: string;

	/** Correlation ID for request tracking */
	correlationId?: string;

	/** Current page number (for paginated responses) */
	page?: number;

	/** Number of items per page (for paginated responses) */
	limit?: number;

	/** Total number of items (for paginated responses) */
	total?: number;
}

/**
 * Standard API response wrapper with data and metadata.
 *
 * @template T Type of the response data
 */
export interface TransformedResponse<T> {
	/** Response data payload */
	data: T;

	/** Response metadata */
	meta: ResponseMeta;
}

/**
 * Marker interface for paginated response data.
 *
 * Controllers can return objects implementing this interface to
 * automatically include pagination metadata in the response.
 */
export interface PaginatedData<T> {
	/** Array of items for current page */
	items: Array<T>;

	/** Total number of items across all pages */
	total: number;

	/** Current page number */
	page: number;

	/** Number of items per page */
	limit: number;
}

/**
 * Intercepts HTTP responses to wrap them in a standard format with metadata.
 *
 * Automatically wraps all successful responses in `{ data, meta }` structure.
 * Includes correlation ID, timestamp, and pagination metadata (if applicable).
 * Does not transform error responses (handled by HttpExceptionFilter).
 *
 * @template T Type of the response data
 *
 * @example
 * ```typescript
 * // Before transformation
 * return { id: '123', name: 'John' };
 *
 * // After transformation
 * {
 *   data: { id: '123', name: 'John' },
 *   meta: {
 *     timestamp: '2025-11-25T10:00:00.000Z',
 *     correlationId: 'uuid-here'
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Paginated response before transformation
 * return {
 *   items: [{ id: '1' }, { id: '2' }],
 *   total: 100,
 *   page: 1,
 *   limit: 20
 * };
 *
 * // After transformation
 * {
 *   data: [{ id: '1' }, { id: '2' }],
 *   meta: {
 *     timestamp: '2025-11-25T10:00:00.000Z',
 *     correlationId: 'uuid-here',
 *     page: 1,
 *     limit: 20,
 *     total: 100
 *   }
 * }
 * ```
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, TransformedResponse<T>> {
	/**
	 * Intercepts controller responses to apply standard transformation.
	 *
	 * @param context ExecutionContext providing access to request/response
	 * @param next CallHandler to proceed with request handling
	 *
	 * @returns Observable of transformed response
	 */
	intercept(context: ExecutionContext, next: CallHandler): Observable<TransformedResponse<T>> {
		const correlationId = correlationIdStorage.getStore();

		return next.handle().pipe(
			map((data: T) => {
				const meta: ResponseMeta = {
					timestamp: new Date().toISOString(),
					correlationId,
				};

				if (this.isPaginatedData(data)) {
					meta.page = data.page;
					meta.limit = data.limit;
					meta.total = data.total;

					return { data: data.items as T, meta };
				}

				return { data, meta };
			}),
		);
	}

	/**
	 * Type guard to check if data is a paginated response.
	 *
	 * @param data Response data to check
	 *
	 * @returns `true` if data is paginated, `false` otherwise
	 */
	private isPaginatedData(data: unknown): data is PaginatedData<unknown> {
		return (
			typeof data === "object" &&
			data != null &&
			"items" in data &&
			"total" in data &&
			"page" in data &&
			"limit" in data &&
			Array.isArray((data as PaginatedData<unknown>).items)
		);
	}
}
