import type {
	ApiResponse,
	CropDistribution,
	LandUseStats,
	StateDistribution,
} from "@agro/shared/types";

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
		 * Fetches total area in hectares.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetTotalAreaStatsQuery();
		 * console.log(`Total farms: ${data?.totalFarms}, Total area: ${data?.totalAreaHectares} ha`);
		 * ```
		 */
		getTotalAreaStats: builder.query<number, unknown>({
			query: () => "/farms/stats/total-area",
			transformResponse: (response: ApiResponse<number>) => response.data,
			providesTags: [{ type: "DashboardStats", id: "TOTAL_AREA" }],
		}),

		/**
		 * Fetches total farms count.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetTotalFarmsCountQuery();
		 * console.log(`Total farms: ${data}`);
		 * ```
		 */
		getTotalFarmsCount: builder.query<number, unknown>({
			query: () => "/farms/stats/count",
			transformResponse: (response: ApiResponse<number>) => response.data,
			providesTags: [{ type: "DashboardStats", id: "TOTAL_FARMS" }],
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
			transformResponse: (response: ApiResponse<StateDistribution[]>) => response.data,
			providesTags: [{ type: "DashboardStats", id: "STATE_DISTRIBUTION" }],
		}),

		/**
		 * Fetches crop distribution with percentages.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetCropDistributionQuery();
		 * data?.forEach(({ cropType, count, percentage }) =>
		 *   console.log(`${cropType}: ${count} (${percentage}%)`)
		 * );
		 * ```
		 */
		getCropDistribution: builder.query<CropDistribution[], unknown>({
			query: () => "/farms/stats/crops-distribution",
			transformResponse: (response: ApiResponse<CropDistribution[]>) => response.data,
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
			transformResponse: (response: ApiResponse<LandUseStats>) => response.data,
			providesTags: [{ type: "DashboardStats", id: "LAND_USE" }],
		}),

		/**
		 * Fetches total producers count.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetProducersCountQuery();
		 * console.log(`Total producers: ${data}`);
		 * ```
		 */
		getProducersCount: builder.query<number, unknown>({
			query: () => "/producers/stats/count",
			transformResponse: (response: ApiResponse<number>) => response.data,
			providesTags: [{ type: "DashboardStats", id: "PRODUCERS_COUNT" }],
		}),
	}),
});

export const {
	useGetTotalAreaStatsQuery,
	useGetTotalFarmsCountQuery,
	useGetStateDistributionQuery,
	useGetCropDistributionQuery,
	useGetLandUseStatsQuery,
	useGetProducersCountQuery,
} = dashboardApi;
