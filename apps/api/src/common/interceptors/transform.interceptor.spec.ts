/**
 * @fileoverview Tests for the {@link TransformInterceptor}.
 *
 * Verifies response wrapping with metadata, pagination handling, and correlation ID injection.
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { of } from "rxjs";

import type { PaginatedData } from "./transform.interceptor";
import type { CallHandler, ExecutionContext } from "@nestjs/common";

import { correlationIdStorage } from "./correlation-id.interceptor";
import { TransformInterceptor } from "./transform.interceptor";

describe("TransformInterceptor", () => {
	let interceptor: TransformInterceptor<unknown>;
	const mockContext = {} as ExecutionContext;
	const DEFAULT_CORRELATION_ID = "default-correlation-id";

	beforeEach(() => {
		interceptor = new TransformInterceptor();
	});

	describe("intercept", () => {
		it("should wrap simple response in data/meta structure", (done) => {
			const responseData = { id: "123", name: "John" };
			const mockCallHandler: CallHandler = {
				handle: () => of(responseData),
			};

			const correlationId = "test-correlation-id";
			correlationIdStorage.run(correlationId, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.meta.correlationId).toBe(correlationId);
					expect(typeof result.meta.timestamp).toBe("string");
					done();
				});
			});
		});

		it("should include correlation ID in meta", (done) => {
			const responseData = { value: "test" };
			const mockCallHandler: CallHandler = {
				handle: () => of(responseData),
			};

			const correlationId = "custom-correlation-id";
			correlationIdStorage.run(correlationId, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.meta.correlationId).toBe(correlationId);
					done();
				});
			});
		});

		it("should handle paginated responses", (done) => {
			const paginatedData: PaginatedData<{ id: string }> = {
				items: [{ id: "1" }, { id: "2" }],
				total: 100,
				page: 1,
				limit: 20,
			};

			const mockCallHandler: CallHandler = {
				handle: () => of(paginatedData),
			};

			correlationIdStorage.run(DEFAULT_CORRELATION_ID, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.meta.correlationId).toBe(DEFAULT_CORRELATION_ID);
					expect(typeof result.meta.timestamp).toBe("string");
					expect(result.meta.page).toBe(paginatedData.page);
					expect(result.meta.limit).toBe(paginatedData.limit);
					expect(result.meta.total).toBe(paginatedData.total);
					expect(result.data).toEqual(paginatedData.items);
					done();
				});
			});
		});

		it("should handle empty array response", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of([]),
			};

			correlationIdStorage.run(DEFAULT_CORRELATION_ID, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.meta.correlationId).toBe(DEFAULT_CORRELATION_ID);
					expect(typeof result.meta.timestamp).toBe("string");
					done();
				});
			});
		});

		it("should handle null response", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of(null),
			};

			correlationIdStorage.run(DEFAULT_CORRELATION_ID, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.data).toBe(null);
					expect(result.meta.correlationId).toBe(DEFAULT_CORRELATION_ID);
					expect(typeof result.meta.timestamp).toBe("string");
					done();
				});
			});
		});

		it("should handle undefined response", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of(undefined),
			};

			correlationIdStorage.run(DEFAULT_CORRELATION_ID, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.meta.correlationId).toBe(DEFAULT_CORRELATION_ID);
					expect(typeof result.meta.timestamp).toBe("string");
					expect(result.data).toBe(undefined);
					done();
				});
			});
		});

		it("should generate ISO timestamp", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of({ value: "test" }),
			};

			correlationIdStorage.run(DEFAULT_CORRELATION_ID, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
					done();
				});
			});
		});

		it("should not add pagination meta to non-paginated arrays", (done) => {
			const arrayData = [{ id: "1" }, { id: "2" }];
			const mockCallHandler: CallHandler = {
				handle: () => of(arrayData),
			};

			correlationIdStorage.run(DEFAULT_CORRELATION_ID, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.meta).not.toHaveProperty("page");
					expect(result.meta).not.toHaveProperty("limit");
					expect(result.meta).not.toHaveProperty("total");
					expect(result.data).toEqual(arrayData);
					done();
				});
			});
		});

		it("should handle string response", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of("simple string"),
			};

			correlationIdStorage.run(DEFAULT_CORRELATION_ID, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.data).toBe("simple string");
					expect(result.meta.correlationId).toBe(DEFAULT_CORRELATION_ID);
					expect(typeof result.meta.timestamp).toBe("string");
					done();
				});
			});
		});

		it("should handle number response", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of(42),
			};

			correlationIdStorage.run(DEFAULT_CORRELATION_ID, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result.data).toBe(42);
					expect(result.meta.correlationId).toBe(DEFAULT_CORRELATION_ID);
					expect(typeof result.meta.timestamp).toBe("string");
					done();
				});
			});
		});

		it("should work without correlation ID", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of({ value: "test" }),
			};

			interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
				expect(result.meta.correlationId).toBeUndefined();
				done();
			});
		});
	});
});
