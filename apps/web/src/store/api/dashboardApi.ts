import type { ApiResponse, DashboardStats } from "@agro/shared/types";

import { api } from "./baseApi";

/**
 * Dashboard statistics API endpoints using RTK Query.
 *
 * Provides a single optimized hook for fetching all dashboard statistics
 * in one request, replacing multiple individual endpoints.
 *
 * ## Performance Benefits
 * - Single HTTP request instead of 6+
 * - Parallel database queries on backend
 * - Reduced network latency
 * - Atomic data consistency
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGetDashboardStatsQuery();
 *
 * console.log(`Total farms: ${data?.totals.farms}`);
 * console.log(`Average area: ${data?.averages.areaPerFarm} ha`);
 * console.log(`Top farm: ${data?.topRecords.largestFarms[0]?.name}`);
 * ```
 */
export const dashboardApi = api.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetches all dashboard statistics in a single aggregated response.
		 *
		 * Returns comprehensive metrics including:
		 * - Totals (farms, producers, areas)
		 * - Averages (area per farm, farms per producer, percentages)
		 * - Distributions (by state, city, crop, producer)
		 * - Top records (largest farms, most productive producers)
		 * - Land use breakdown
		 *
		 * Cache is invalidated when farms or producers are created/updated/deleted.
		 *
		 * @example
		 * ```tsx
		 * function Dashboard() {
		 *   const { data: stats, isLoading, error, refetch } = useGetDashboardStatsQuery();
		 *
		 *   if (isLoading) return <Skeleton />;
		 *   if (error) return <Error message="Failed to load" onRetry={refetch} />;
		 *
		 *   return (
		 *     <>
		 *       <StatCard value={stats.totals.farms} label="Total Farms" />
		 *       <BarChart data={stats.distributions.byState} />
		 *       <Table data={stats.topRecords.largestFarms} />
		 *     </>
		 *   );
		 * }
		 * ```
		 */
		getDashboardStats: builder.query<DashboardStats, void>({
			query: () => "/dashboard/stats",
			transformResponse: (response: ApiResponse<DashboardStats>) => response.data,
			providesTags: [{ type: "DashboardStats", id: "ALL" }],
		}),
	}),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
