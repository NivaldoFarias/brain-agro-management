import type { ApiResponse, CitiesByState, CityData, ListAllData } from "@agro/shared/types";

import { ROUTES } from "@agro/shared/constants";

import { api } from "./baseApi";

/**
 * Cities API endpoints using RTK Query.
 *
 * Provides auto-generated hooks for querying Brazilian cities
 * from the IBGE-populated database with automatic caching.
 */
export const citiesApi = api.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetches paginated list of all cities.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetCitiesQuery({ page: 1, limit: 100 });
		 * ```
		 */
		getCities: builder.query<ListAllData<CityData>, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 100 }) => ({
				url: ROUTES.api.cities.base,
				params: { page, limit },
			}),
			transformResponse: (response: ApiResponse<ListAllData<CityData>>) => response.data,
			providesTags: [{ type: "Cities", id: "LIST" }],
		}),

		/**
		 * Retrieves all cities grouped by state for form dropdowns.
		 *
		 * Returns all ~5,570 Brazilian cities organized by state.
		 * Intended for client-side caching to populate city dropdowns.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetAllCitiesByStateQuery();
		 * // data.SP = ["São Paulo", "Campinas", ...]
		 * ```
		 */
		getAllCitiesByState: builder.query<CitiesByState, undefined>({
			query: () => ROUTES.api.cities.groupedByState,
			transformResponse: (response: ApiResponse<CitiesByState>) => response.data,
			providesTags: [{ type: "Cities", id: "ALL_BY_STATE" }],
		}),

		/**
		 * Gets the total count of cities in the database.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetCitiesCountQuery();
		 * ```
		 */
		getCitiesCount: builder.query<{ total: number }, undefined>({
			query: () => ROUTES.api.cities.count,
			transformResponse: (response: ApiResponse<{ total: number }>) => response.data,
			providesTags: [{ type: "Cities", id: "COUNT" }],
		}),

		/**
		 * Retrieves a city by its IBGE code.
		 *
		 * The IBGE code is a 7-digit municipal code assigned by the Brazilian Institute
		 * of Geography and Statistics.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetCityByIbgeCodeQuery("3550308"); // São Paulo
		 * ```
		 */
		getCityByIbgeCode: builder.query<CityData | null, string>({
			query: (ibgeCode) => ROUTES.api.cities.byIbgeCode(ibgeCode),
			transformResponse: (response: ApiResponse<CityData | null>) => response.data,
			providesTags: (result, error, ibgeCode) => [{ type: "Cities", id: `IBGE_${ibgeCode}` }],
		}),
	}),
});

export const {
	useGetCitiesQuery,
	useGetAllCitiesByStateQuery,
	useGetCitiesCountQuery,
	useGetCityByIbgeCodeQuery,
} = citiesApi;
