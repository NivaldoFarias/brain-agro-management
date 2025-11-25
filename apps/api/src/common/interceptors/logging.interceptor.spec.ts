/**
 * @fileoverview Tests for the {@link LoggingInterceptor}.
 *
 * Verifies request/response logging, IP extraction, sensitive field sanitization,
 * and health check endpoint exclusion.
 */

import { PinoLogger } from "nestjs-pino";
import { of, throwError } from "rxjs";

import type { CallHandler, ExecutionContext } from "@nestjs/common";

import { correlationIdStorage } from "./correlation-id.interceptor";
import { LoggingInterceptor } from "./logging.interceptor";

describe("LoggingInterceptor", () => {
	let interceptor: LoggingInterceptor;
	let logger: jest.Mocked<PinoLogger>;
	let mockContext: ExecutionContext;
	let mockCallHandler: CallHandler;

	const mockRequest = {
		method: "GET",
		url: "/api/producers",
		query: { page: "1" },
		headers: {
			"user-agent": "Jest Test",
			"x-forwarded-for": "192.168.1.1",
		},
		body: { name: "Test Producer" },
		socket: { remoteAddress: "127.0.0.1" },
	};

	const mockResponse = {
		statusCode: 200,
		setHeader: jest.fn(),
	};

	beforeEach(() => {
		logger = {
			setContext: jest.fn(),
			info: jest.fn(),
			error: jest.fn(),
		} as unknown as jest.Mocked<PinoLogger>;

		interceptor = new LoggingInterceptor(logger);

		mockContext = {
			switchToHttp: () => ({
				getRequest: () => mockRequest,
				getResponse: () => mockResponse,
			}),
		} as unknown as ExecutionContext;

		mockCallHandler = {
			handle: jest.fn(() => of({ data: "test response" })),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("intercept", () => {
		it("should log incoming request with correlation ID", (done) => {
			const correlationId = "test-correlation-id";
			correlationIdStorage.run(correlationId, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
					expect(logger.info).toHaveBeenCalledWith(
						expect.objectContaining({
							msg: "Incoming request",
							correlationId,
							http: expect.objectContaining({
								method: "GET",
								url: "/api/producers",
								query: { page: "1" },
								userAgent: "Jest Test",
								ip: "192.168.1.1",
							}),
						}),
					);
					done();
				});
			});
		});

		it("should log outgoing response with duration and status code", (done) => {
			const correlationId = "test-correlation-id";
			correlationIdStorage.run(correlationId, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
					expect(logger.info).toHaveBeenCalledWith(
						expect.objectContaining({
							msg: "Outgoing response",
							correlationId,
							http: expect.objectContaining({
								method: "GET",
								url: "/api/producers",
								statusCode: 200,
								duration: expect.any(Number),
								responseSize: expect.any(Number),
							}),
						}),
					);
					done();
				});
			});
		});

		it("should log error when request fails", (done) => {
			const error = new Error("Test error");
			mockCallHandler.handle = jest.fn(() => throwError(() => error));

			const correlationId = "test-correlation-id";
			correlationIdStorage.run(correlationId, () => {
				interceptor.intercept(mockContext, mockCallHandler).subscribe({
					error: () => {
						expect(logger.error).toHaveBeenCalledWith(
							expect.objectContaining({
								msg: "Request failed",
								correlationId,
								http: expect.objectContaining({
									method: "GET",
									url: "/api/producers",
									duration: expect.any(Number),
								}),
								error: {
									name: "Error",
									message: "Test error",
									stack: expect.any(String),
								},
							}),
						);
						done();
					},
				});
			});
		});

		it("should skip logging for health check endpoints", (done) => {
			const healthRequest = { ...mockRequest, url: "/api/health" };
			const healthContext = {
				switchToHttp: () => ({
					getRequest: () => healthRequest,
					getResponse: () => mockResponse,
				}),
			} as unknown as ExecutionContext;

			interceptor.intercept(healthContext, mockCallHandler).subscribe(() => {
				expect(logger.info).not.toHaveBeenCalled();
				done();
			});
		});

		it("should sanitize sensitive fields in request body", (done) => {
			const sensitiveRequest = {
				...mockRequest,
				body: {
					name: "Test",
					password: "secret123",
					token: "bearer-token",
				},
			};

			const sensitiveContext = {
				switchToHttp: () => ({
					getRequest: () => sensitiveRequest,
					getResponse: () => mockResponse,
				}),
			} as unknown as ExecutionContext;

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(sensitiveContext, mockCallHandler).subscribe(() => {
					const logCall = logger.info.mock.calls[0]?.[0] as Record<string, unknown>;
					const httpBody = (logCall["http"] as Record<string, unknown>)["body"] as Record<
						string,
						unknown
					>;

					expect(httpBody).toEqual({
						name: "Test",
						password: "***REDACTED***",
						token: "***REDACTED***",
					});
					done();
				});
			});
		});

		it("should extract IP from X-Forwarded-For header", (done) => {
			const requestWithProxy = {
				...mockRequest,
				headers: {
					...mockRequest.headers,
					"x-forwarded-for": "203.0.113.1, 198.51.100.1",
				},
			};

			const proxyContext = {
				switchToHttp: () => ({
					getRequest: () => requestWithProxy,
					getResponse: () => mockResponse,
				}),
			} as unknown as ExecutionContext;

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(proxyContext, mockCallHandler).subscribe(() => {
					const logCall = logger.info.mock.calls[0]?.[0] as Record<string, unknown>;
					const httpInfo = logCall["http"] as Record<string, unknown>;

					expect(httpInfo["ip"]).toBe("203.0.113.1");
					done();
				});
			});
		});

		it("should extract IP from X-Real-IP header", (done) => {
			const requestWithRealIp = {
				...mockRequest,
				headers: {
					...mockRequest.headers,
					"x-forwarded-for": undefined,
					"x-real-ip": "203.0.113.5",
				},
			};

			const realIpContext = {
				switchToHttp: () => ({
					getRequest: () => requestWithRealIp,
					getResponse: () => mockResponse,
				}),
			} as unknown as ExecutionContext;

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(realIpContext, mockCallHandler).subscribe(() => {
					const logCall = logger.info.mock.calls[0]?.[0] as Record<string, unknown>;
					const httpInfo = logCall["http"] as Record<string, unknown>;

					expect(httpInfo["ip"]).toBe("203.0.113.5");
					done();
				});
			});
		});

		it("should fall back to socket IP when no proxy headers", (done) => {
			const requestWithoutProxy = {
				...mockRequest,
				headers: {
					"user-agent": "Jest Test",
				},
			};

			const directContext = {
				switchToHttp: () => ({
					getRequest: () => requestWithoutProxy,
					getResponse: () => mockResponse,
				}),
			} as unknown as ExecutionContext;

			correlationIdStorage.run("test-id", () => {
				interceptor.intercept(directContext, mockCallHandler).subscribe(() => {
					const logCall = logger.info.mock.calls[0]?.[0] as Record<string, unknown>;
					const httpInfo = logCall["http"] as Record<string, unknown>;

					expect(httpInfo["ip"]).toBe("127.0.0.1");
					done();
				});
			});
		});
	});
});
