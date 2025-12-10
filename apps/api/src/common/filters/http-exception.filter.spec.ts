import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { Logger } from "nestjs-pino";

import type { ArgumentsHost } from "@nestjs/common";

import { correlationIdStorage } from "../interceptors/correlation-id.interceptor";

import { HttpExceptionFilter } from "./http-exception.filter";

/**
 * @fileoverview Tests for the {@link HttpExceptionFilter}.
 *
 * Verifies exception handling, error response formatting, logging behavior,
 * and correlation ID injection.
 */
describe("HttpExceptionFilter", () => {
	let filter: HttpExceptionFilter;
	let logger: Logger & {
		error: ReturnType<typeof mock>;
		warn: ReturnType<typeof mock>;
		debug: ReturnType<typeof mock>;
	};
	let mockResponse: {
		status: ReturnType<typeof mock>;
		json: ReturnType<typeof mock>;
	};
	let mockRequest: {
		url: string;
		method: string;
		headers: Record<string, string>;
		body: Record<string, unknown>;
		query: Record<string, unknown>;
	};
	let mockHost: ArgumentsHost;

	beforeEach(() => {
		const statusMock = mock(() => mockResponse);
		const jsonMock = mock(() => undefined);

		logger = {
			error: mock(() => undefined),
			warn: mock(() => undefined),
			debug: mock(() => undefined),
		} as unknown as Logger & {
			error: ReturnType<typeof mock>;
			warn: ReturnType<typeof mock>;
			debug: ReturnType<typeof mock>;
		};

		mockResponse = {
			status: statusMock,
			json: jsonMock,
		};

		mockRequest = {
			url: "/api/producers",
			method: "GET",
			headers: { "user-agent": "Jest Test" },
			body: {},
			query: {},
		};

		mockHost = {
			switchToHttp: () => ({
				getResponse: () => mockResponse,
				getRequest: () => mockRequest,
			}),
		} as unknown as ArgumentsHost;

		filter = new HttpExceptionFilter(logger);
	});

	afterEach(() => {
		mock.restore();
	});

	describe("catch", () => {
		it("should handle HttpException with correlation ID", () => {
			const exception = new BadRequestException("Invalid input");
			const correlationId = "test-correlation-id";

			correlationIdStorage.run(correlationId, () => {
				filter.catch(exception, mockHost);

				expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
				expect(mockResponse.json).toHaveBeenCalledWith(
					expect.objectContaining({
						statusCode: HttpStatus.BAD_REQUEST,
						message: "Invalid input",
						error: "Bad Request",
						timestamp: expect.any(String),
						path: "/api/producers",
						correlationId,
					}),
				);
			});
		});

		it("should handle HttpException with array of messages", () => {
			const exception = new BadRequestException(["Field 1 error", "Field 2 error"]);

			filter.catch(exception, mockHost);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: ["Field 1 error", "Field 2 error"],
				}),
			);
		});

		it("should handle unexpected errors as 500 Internal Server Error", () => {
			const exception = new Error("Unexpected error");

			filter.catch(exception, mockHost);

			expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					message: "Internal server error",
					error: "InternalServerError",
				}),
			);
		});

		it("should log 4xx errors as warnings", () => {
			const exception = new BadRequestException("Bad input");

			filter.catch(exception, mockHost);

			expect(logger.warn).toHaveBeenCalledWith(
				expect.objectContaining({
					msg: "Client error occurred",
					http: expect.objectContaining({
						statusCode: HttpStatus.BAD_REQUEST,
					}),
					exception: expect.objectContaining({
						name: "BadRequestException",
						message: "Bad input",
					}),
				}),
			);
		});

		it("should log 5xx errors as errors", () => {
			const exception = new HttpException("Server error", HttpStatus.INTERNAL_SERVER_ERROR);

			filter.catch(exception, mockHost);

			expect(logger.error).toHaveBeenCalledWith(
				expect.objectContaining({
					msg: "Server error occurred",
					http: expect.objectContaining({
						statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					}),
					exception: expect.objectContaining({
						name: "HttpException",
						message: "Server error",
						stack: expect.any(String),
					}),
				}),
			);
		});

		it("should include exception stack trace in logs", () => {
			const exception = new Error("Test error");

			filter.catch(exception, mockHost);

			expect(logger.error).toHaveBeenCalledWith(
				expect.objectContaining({
					msg: "Server error occurred",
					exception: expect.objectContaining({
						name: "Error",
						message: "Test error",
						stack: expect.any(String),
					}),
				}),
			);
		});

		it("should include request body in logs for client errors", () => {
			mockRequest.body = { field: "value" };
			const exception = new BadRequestException("Invalid");

			filter.catch(exception, mockHost);

			expect(logger.warn).toHaveBeenCalledWith(
				expect.objectContaining({
					requestBody: { field: "value" },
				}),
			);
		});

		it("should not include request body for server errors", () => {
			mockRequest.body = { field: "value" };
			const exception = new HttpException("Server error", HttpStatus.INTERNAL_SERVER_ERROR);

			filter.catch(exception, mockHost);

			const logCall = logger.error.mock.calls[0]?.[0] as Record<string, unknown>;
			expect(logCall).not.toHaveProperty("requestBody");
		});

		it("should handle string exception responses", () => {
			const exception = new HttpException("Simple error", HttpStatus.NOT_FOUND);

			filter.catch(exception, mockHost);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Simple error",
				}),
			);
		});
	});
});
