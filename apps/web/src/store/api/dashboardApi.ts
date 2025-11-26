import type {
	CropDistribution,
	LandUseStats,
	StateDistribution,
	TotalAreaStats,
} from "@agro/shared/types/dashboard.types";

import { api } from "./baseApi";

/**
 * Dashboard statistics API endpoints using RTK Query.
 *
 * Provides hooks for fetching aggregated farm statistics
 * for dashboard visualizations.
 */
export const dashboardApi = api.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetches total farms count and total area in hectares.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetTotalAreaStatsQuery();
		 * console.log(`Total farms: ${data?.totalFarms}, Total area: ${data?.totalAreaHectares} ha`);
		 * ```
		 */
		getTotalAreaStats: builder.query<TotalAreaStats, unknown>({
			query: () => "/farms/stats/total-area",
			providesTags: [{ type: "DashboardStats", id: "TOTAL_AREA" }],
		}),

		/**
		 * Fetches farm distribution by Brazilian state.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetStateDistributionQuery();
		 * data?.forEach(({ state, count }) => console.log(`${state}: ${count} farms`));
		 * ```
		 */
		getStateDistribution: builder.query<StateDistribution[], unknown>({
			query: () => "/farms/stats/by-state",
			providesTags: [{ type: "DashboardStats", id: "STATE_DISTRIBUTION" }],
		}),

		/**
		 * Fetches crop distribution with percentages.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetCropDistributionQuery();
		 * data?.forEach(({ crop, count, percentage }) =>
		 *   console.log(`${crop}: ${count} (${percentage}%)`)
		 * );
		 * ```
		 */
		getCropDistribution: builder.query<CropDistribution[], unknown>({
			query: () => "/farms/stats/crops-distribution",
			providesTags: [{ type: "DashboardStats", id: "CROP_DISTRIBUTION" }],
		}),

		/**
		 * Fetches land use statistics (arable vs vegetation area).
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetLandUseStatsQuery();
		 * console.log(`Arable: ${data?.arablePercentage}%, Vegetation: ${data?.vegetationPercentage}%`);
		 * ```
		 */
		getLandUseStats: builder.query<LandUseStats, unknown>({
			query: () => "/farms/stats/land-use",
			providesTags: [{ type: "DashboardStats", id: "LAND_USE" }],
		}),
	}),
});

export const {
	useGetTotalAreaStatsQuery,
	useGetStateDistributionQuery,
	useGetCropDistributionQuery,
	useGetLandUseStatsQuery,
} = dashboardApi;
