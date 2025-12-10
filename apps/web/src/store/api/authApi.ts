import type { ApiResponse, AuthResponseDto, LoginDto } from "@agro/shared/types";

import { ROUTES } from "@agro/shared/constants";
import { HttpMethod } from "@agro/shared/enums";

import { api } from "./baseApi";

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
		 * const response = await login({ email: "admin@brainag.com", password: "admin123" });
		 * ```
		 */
		login: builder.mutation<AuthResponseDto, LoginDto>({
			query: (credentials) => ({
				url: ROUTES.api.auth.login,
				method: HttpMethod.POST,
				body: credentials,
			}),
			transformResponse: (response: ApiResponse<AuthResponseDto>) => response.data,
		}),
	}),
});

export const { useLoginMutation } = authApi;
