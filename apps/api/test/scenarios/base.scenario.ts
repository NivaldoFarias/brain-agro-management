import request from "supertest";

import type { Server } from "node:http";
import type { Response } from "supertest";

/**
 * Standard NestJS error response structure.
 *
 * Represents the shape of error responses returned by NestJS exception filters.
 * Structure varies based on exception type:
 * - HttpException: `{ statusCode, message }`
 * - ValidationException: `{ statusCode, message: string[], error: string }`
 *
 * @see {@link https://docs.nestjs.com/exception-filters}
 */
export interface ErrorResponse {
	/** HTTP status code */
	statusCode: number;

	/** Error message or array of validation error messages */
	message: string | Array<string>;

	/** Optional error type identifier (present in validation errors) */
	error?: string;
}

/**
 * Type-safe wrapper for HTTP responses with typed body.
 *
 * Extends supertest's Response with a strongly-typed body property that can be
 * either the expected success response type or an error response. This enables
 * full TypeScript inference for both success and error cases in API tests.
 *
 * @template T The expected type of the success response body
 *
 * @example
 * ```typescript
 * const response: TypedResponse<UserDto> = await scenario.getUser(id);
 * if (response.status === 200) {
 *   console.log(response.body.name); // Type-safe access to UserDto
 * } else {
 *   console.log(response.body.message); // Type-safe access to ErrorResponse
 * }
 * ```
 */
export interface TypedResponse<T> extends Omit<Response, "body"> {
	body: T | ErrorResponse;
}

/**
 * Type guard to check if a response body is an error response.
 *
 * Checks for the presence of `statusCode` and `message` fields which are
 * the minimum required fields for NestJS error responses. The `error` field
 * is optional and only present in some error types (e.g., validation errors).
 *
 * @param body Response body to check
 *
 * @returns `true` if body is an {@link ErrorResponse}, false otherwise
 *
 * @example
 * ```typescript
 * const response = await scenario.getUser(id);
 * if (isErrorResponse(response.body)) {
 *   console.log(response.body.message); // ErrorResponse
 * } else {
 *   console.log(response.body.name); // UserDto
 * }
 * ```
 */
export function isErrorResponse(body: unknown): body is ErrorResponse {
	return typeof body === "object" && body != null && "statusCode" in body && "message" in body;
}

/**
 * Asserts that a response body is a success response of type `T`.
 *
 * Throws if the body is an {@link ErrorResponse}, otherwise narrows the type to `T`.
 *
 * @template T Expected success response type
 * @param body Response body to assert
 *
 * @returns The body narrowed to type `T`
 *
 * @example
 * ```typescript
 * const response = await scenario.getUser(id);
 * const user = assertSuccessResponse<UserDto>(response.body);
 * console.log(user.name); // Type-safe access
 * ```
 */
export function assertSuccessResponse<T>(body: T | ErrorResponse): T {
	if (isErrorResponse(body)) {
		throw new Error(`Expected success response but got error: ${JSON.stringify(body)}`);
	}

	return body;
}

/**
 * Base scenario builder providing type-safe HTTP request helpers.
 *
 * Wraps supertest's request methods with type inference, enabling
 * strongly-typed API testing with minimal boilerplate. All HTTP methods
 * return promises that resolve to typed responses.
 *
 * @example
 * ```typescript
 * class UserScenario extends BaseScenario {
 *   async createUser(data: CreateUserDto): Promise<TypedResponse<UserDto>> {
 *     return this.post<UserDto>('/api/users', data);
 *   }
 * }
 * ```
 */
export abstract class BaseScenario {
	protected readonly basePath = "/api";

	/**
	 * Creates a new base scenario builder.
	 *
	 * @param server HTTP server instance from the NestJS test application
	 */
	constructor(protected readonly server: Server) {}

	abstract get path(): string;

	/**
	 * Performs a type-safe GET request.
	 *
	 * @template T Expected response body type
	 * @param path API endpoint path (e.g., `/api/users/123`)
	 *
	 * @returns Promise resolving to typed response
	 *
	 * @example
	 * ```typescript
	 * const response = await this.get<UserDto>('/api/users/123');
	 * console.log(response.body.name); // Type-safe access
	 * ```
	 */
	protected async get<T>(path: string): Promise<TypedResponse<T>> {
		return request(this.server).get(path);
	}

	/**
	 * Performs a type-safe POST request.
	 *
	 * @template T Expected response body type
	 * @param path API endpoint path (e.g., `/api/users`)
	 * @param data Request body data
	 *
	 * @returns Promise resolving to typed response
	 *
	 * @example
	 * ```typescript
	 * const response = await this.post<UserDto>('/api/users', { name: 'John' });
	 * console.log(response.body.id); // Type-safe access
	 * ```
	 */
	protected async post<T>(path: string, data: object): Promise<TypedResponse<T>> {
		return request(this.server).post(path).send(data);
	}

	/**
	 * Performs a type-safe PATCH request.
	 *
	 * @template T Expected response body type
	 * @param path API endpoint path (e.g., `/api/users/123`)
	 * @param data Request body data with fields to update
	 *
	 * @returns Promise resolving to typed response
	 *
	 * @example
	 * ```typescript
	 * const response = await this.patch<UserDto>('/api/users/123', { name: 'Jane' });
	 * console.log(response.body.name); // "Jane" with type safety
	 * ```
	 */
	protected async patch<T>(path: string, data: object): Promise<TypedResponse<T>> {
		return request(this.server).patch(path).send(data);
	}

	/**
	 * Performs a type-safe DELETE request.
	 *
	 * @param path API endpoint path (e.g., `/api/users/123`)
	 *
	 * @returns Promise resolving to supertest response
	 *
	 * @example
	 * ```typescript
	 * const response = await this.delete('/api/users/123');
	 * expect(response.status).toBe(204);
	 * ```
	 */
	protected async delete(path: string): Promise<Response> {
		return request(this.server).delete(path);
	}

	/**
	 * Performs a type-safe HEAD request.
	 *
	 * HEAD requests are identical to GET requests except that the server
	 * only returns headers without the response body. Useful for checking
	 * resource existence, metadata, or performing health checks.
	 *
	 * @param path API endpoint path (e.g., `/api/users/123`)
	 *
	 * @returns Promise resolving to supertest response (with empty body)
	 *
	 * @example
	 * ```typescript
	 * const response = await this.head('/api/users/123');
	 * expect(response.status).toBe(200); // Resource exists
	 * expect(response.headers['content-length']).toBeDefined();
	 * ```
	 */
	protected async head(path: string): Promise<Response> {
		return request(this.server).head(path);
	}

	/**
	 * Performs a type-safe PUT request.
	 *
	 * PUT requests are used for complete resource replacement or creation
	 * with a specific identifier. Unlike PATCH (partial updates), PUT
	 * replaces the entire resource.
	 *
	 * @template T Expected response body type
	 * @param path API endpoint path (e.g., `/api/users/123`)
	 * @param data Complete resource data for replacement
	 *
	 * @returns Promise resolving to typed response
	 *
	 * @example
	 * ```typescript
	 * const response = await this.put<UserDto>('/api/users/123', completeUserData);
	 * console.log(response.body.id); // Type-safe access
	 * ```
	 */
	protected async put<T>(path: string, data: object): Promise<TypedResponse<T>> {
		return request(this.server).put(path).send(data);
	}
}
