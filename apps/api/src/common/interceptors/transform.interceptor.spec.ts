/**
 * @fileoverview Tests for the {@link TransformInterceptor}.
 *
 * Verifies response wrapping with metadata, pagination handling, and correlation ID injection.
 */

import { of } from "rxjs";

import type { PaginatedData } from "./transform.interceptor";
import type { CallHandler, ExecutionContext } from "@nestjs/common";

import { correlationIdStorage } from "./correlation-id.interceptor";
import { TransformInterceptor } from "./transform.interceptor";

describe("TransformInterceptor", () => {
	let interceptor: TransformInterceptor<unknown>;
	const mockContext = {} as ExecutionContext;

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
					expect(result).toEqual({
						data: responseData,
						meta: {
							timestamp: expect(String),
							correlationId,
						},
					});
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

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result).toEqual({
						data: [{ id: "1" }, { id: "2" }],
						meta: {
							timestamp: expect(String),
							correlationId: "test-id",
							page: 1,
							limit: 20,
							total: 100,
						},
					});
					done();
				});
			});
		});

		it("should handle empty array response", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of([]),
			};

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result).toEqual({
						data: [],
						meta: {
							timestamp: expect(String),
							correlationId: "test-id",
						},
					});
					done();
				});
			});
		});

		it("should handle null response", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of(null),
			};

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result).toEqual({
						data: null,
						meta: {
							timestamp: expect(String),
							correlationId: "test-id",
						},
					});
					done();
				});
			});
		});

		it("should handle undefined response", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of(),
			};

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result).toEqual({
						data: undefined,
						meta: {
							timestamp: expect(String),
							correlationId: "test-id",
						},
					});
					done();
				});
			});
		});

		it("should generate ISO timestamp", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of({ value: "test" }),
			};

			correlationIdStorage.run("test-id", () => {
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

			correlationIdStorage.run("test-id", () => {
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

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result).toEqual({
						data: "simple string",
						meta: {
							timestamp: expect(String),
							correlationId: "test-id",
						},
					});
					done();
				});
			});
		});

		it("should handle number response", (done) => {
			const mockCallHandler: CallHandler = {
				handle: () => of(42),
			};

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
					expect(result).toEqual({
						data: 42,
						meta: {
							timestamp: expect(String),
							correlationId: "test-id",
						},
					});
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
