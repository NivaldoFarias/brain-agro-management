import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { env } from "@/utils";

/**
 * Base RTK Query API slice for Brain Agriculture application.
 *
 * Provides centralized API configuration with automatic caching,
 * loading states, and request deduplication. Uses tagged cache
 * invalidation for optimistic updates.
 *
 * @see {@link https://redux-toolkit.js.org/rtk-query/overview|RTK Query Documentation}
 */
export const api = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: env.WEB__VITE_API_BASE_URL,
		prepareHeaders: (headers) => {
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Producer", "Farm", "DashboardStats"],
	endpoints: () => ({}),
});
