import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { env } from "@/utils";

/**
 * RTK Query API slice for producer-related endpoints.
 *
 * Provides auto-generated hooks for CRUD operations on producers with
 * automatic caching, loading states, and cache invalidation.
 *
 * @see {@link https://redux-toolkit.js.org/rtk-query/overview|RTK Query Documentation}
 */
export const producersApi = createApi({
	reducerPath: "producersApi",
	baseQuery: fetchBaseQuery({ baseUrl: env.WEB__VITE_API_BASE_URL }),
	tagTypes: ["Producer"],
	endpoints: () => ({}),
});
