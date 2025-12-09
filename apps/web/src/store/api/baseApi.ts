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
 * Automatically injects authentication token into request headers, if available.
 *
 * @see {@link https://redux-toolkit.js.org/rtk-query/overview|RTK Query Documentation}
 */
export const api = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: env.WEB__VITE_API_BASE_URL,
		prepareHeaders: (headers) => {
			headers.set("Content-Type", "application/json");

			const token = getAuthToken();

			if (!token) return headers;

			headers.set("Authorization", `Bearer ${token}`);

			return headers;
		},
	}),
	tagTypes: ["Producer", "Farm", "DashboardStats", "Cities"],
	endpoints: () => ({}),
});
