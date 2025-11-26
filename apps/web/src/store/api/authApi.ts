import type { AuthResponseDto } from "@agro/shared/types/auth.types";

import { HttpMethod } from "@agro/shared/utils/constants.util";

import { api } from "./baseApi";

/**
 * Login request payload interface.
 */
export interface LoginRequest {
	/** User email */
	email: string;
	/** User password */
	password: string;
}

/**
 * Backend API response wrapper interface.
 */
interface ApiResponse<T> {
	data: T;
	meta: {
		timestamp: string;
		correlationId?: string;
	};
}

/**
 * Authentication API endpoints using RTK Query.
 *
 * Provides login functionality with automatic token caching.
 */
export const authApi = api.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Login mutation that authenticates user and returns JWT token.
		 *
		 * @example
		 * ```tsx
		 * const [login, { isLoading }] = useLoginMutation();
		 * const response = await login({ email: "admin@example.com", password: "admin123" });
		 * ```
		 */
		login: builder.mutation<AuthResponseDto, LoginRequest>({
			query: (credentials) => ({
				url: "/auth/login",
				method: HttpMethod.POST,
				body: credentials,
			}),
			transformResponse: (response: ApiResponse<AuthResponseDto>) => response.data,
		}),
	}),
});

export const { useLoginMutation } = authApi;
