import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getAuthToken } from "@/contexts/AuthContext";
import { env } from "@/utils";

/**
 * Base RTK Query API slice for Brain Agriculture application.
 *
 * Provides centralized API configuration with automatic caching,
 * loading states, and request deduplication. Uses tagged cache
 * invalidation for optimistic updates.
 *
 * Automatically injects authentication token into request headers.
 *
 * @see {@link https://redux-toolkit.js.org/rtk-query/overview|RTK Query Documentation}
 */
export const api = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: env.WEB__VITE_API_BASE_URL,
		prepareHeaders: (headers) => {
			headers.set("Content-Type", "application/json");

			// Inject authentication token if available
			const token = getAuthToken();
			console.log(
				"[baseApi] prepareHeaders - token from localStorage:",
				token ? `${token.slice(0, 20)}...` : "NULL",
			);
			console.log("[baseApi] prepareHeaders - localStorage keys:", Object.keys(localStorage));
			console.log("[baseApi] prepareHeaders - API base URL:", env.WEB__VITE_API_BASE_URL);

			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
				console.log("[baseApi] prepareHeaders - Authorization header set");
			} else {
				console.warn("[baseApi] prepareHeaders - No token available, request will be unauthorized");
			}

			return headers;
		},
	}),
	tagTypes: ["Producer", "Farm", "DashboardStats"],
	endpoints: () => ({}),
});
