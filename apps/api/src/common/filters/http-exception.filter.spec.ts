import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

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
	let logger: jest.Mocked<PinoLogger>;
	let mockResponse: {
		status: jest.Mock;
		json: jest.Mock;
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
		logger = {
			setContext: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		} as unknown as jest.Mocked<PinoLogger>;

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
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
		jest.clearAllMocks();
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
						timestamp: expect(String),
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
					msg: "Exception caught",
					http: expect.objectContaining({
						statusCode: HttpStatus.BAD_REQUEST,
					}),
				}),
			);
		});

		it("should log 5xx errors as errors", () => {
			const exception = new HttpException("Server error", HttpStatus.INTERNAL_SERVER_ERROR);

			filter.catch(exception, mockHost);

			expect(logger.error).toHaveBeenCalledWith(
				expect.objectContaining({
					msg: "Exception caught",
					http: expect.objectContaining({
						statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					}),
				}),
			);
		});

		it("should include exception stack trace in logs", () => {
			const exception = new Error("Test error");

			filter.catch(exception, mockHost);

			expect(logger.error).toHaveBeenCalledWith(
				expect.objectContaining({
					exception: expect.objectContaining({
						name: "Error",
						message: "Test error",
						stack: expect(String),
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
