import type { ApiResponse, CityData, ListAllData } from "@agro/shared/types";

import { ROUTE_PATHS } from "@agro/shared/constants";

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
				url: ROUTE_PATHS.cities,
				params: { page, limit },
			}),
			transformResponse: (response: ApiResponse<ListAllData<CityData>>) => response.data,
			providesTags: [{ type: "Cities", id: "LIST" }],
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
			query: () => ROUTE_PATHS.citiesCount,
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
			query: (ibgeCode) => `${ROUTE_PATHS.citiesByIbgeCode}/${ibgeCode}`,
			transformResponse: (response: ApiResponse<CityData | null>) => response.data,
			providesTags: (result, error, ibgeCode) => [{ type: "Cities", id: `IBGE_${ibgeCode}` }],
		}),
	}),
});

export const { useGetCitiesQuery, useGetCitiesCountQuery, useGetCityByIbgeCodeQuery } = citiesApi;
