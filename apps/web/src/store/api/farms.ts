import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { env } from "@/utils";

/**
 * RTK Query API slice for farm-related endpoints.
 *
 * Provides auto-generated hooks for CRUD operations on farms and statistics
 * with automatic caching, loading states, and cache invalidation.
 *
 * @see {@link https://redux-toolkit.js.org/rtk-query/overview|RTK Query Documentation}
 */
export const farmsApi = createApi({
	reducerPath: "farmsApi",
	baseQuery: fetchBaseQuery({ baseUrl: env.WEB__VITE_API_BASE_URL }),
	tagTypes: ["Farm", "FarmStats"],
	endpoints: () => ({}),
});
