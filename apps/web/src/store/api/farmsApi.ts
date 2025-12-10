import type {
	ApiResponse,
	CreateFarmRequest,
	Farm,
	FarmFilterOptions,
	FarmsListResponse,
	UpdateFarmRequest,
} from "@agro/shared/types";

import { ROUTES } from "@agro/shared/constants";
import { HttpMethod } from "@agro/shared/enums";

import { api } from "./baseApi";

/**
 * Farms API endpoints using RTK Query.
 *
 * Provides auto-generated hooks for CRUD operations on farms
 * with automatic caching and cache invalidation.
 */
export const farmsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetches paginated list of farms with sorting, filtering, and search.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetFarmsQuery({
		 *   page: 1,
		 *   limit: 10,
		 *   sortBy: "totalArea",
		 *   sortOrder: "DESC",
		 *   state: "SP",
		 *   search: "Fazenda"
		 * });
		 * ```
		 */
		getFarms: builder.query<FarmsListResponse, FarmFilterOptions>({
			query: ({
				page = 1,
				limit = 10,
				sortBy,
				sortOrder,
				search,
				state,
				city,
				producerId,
				crops,
			} = {}) => {
				return {
					url: ROUTES.api.farms.base,
					params: {
						page,
						limit,
						...(sortBy && { sortBy }),
						...(sortOrder && { sortOrder }),
						...(search && { search }),
						...(state && { state }),
						...(city && { city }),
						...(producerId && { producerId }),
						...(crops && crops.length > 0 && { crops: crops.join(",") }),
					},
				};
			},
			transformResponse: (response: ApiResponse<FarmsListResponse>) => response.data,
			providesTags: (result) =>
				result ?
					[
						...result.data.map(({ id }) => ({ type: "Farm" as const, id })),
						{ type: "Farm", id: "LIST" },
					]
				:	[{ type: "Farm", id: "LIST" }],
		}),

		/**
		 * Fetches single farm by ID.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetFarmByIdQuery(farmId);
		 * ```
		 */
		getFarmById: builder.query<Farm, string>({
			query: (id) => ROUTES.api.farms.byId(id),
			transformResponse: (response: ApiResponse<Farm>) => response.data,
			providesTags: (result, error, id) => [{ type: "Farm", id }],
		}),

		/**
		 * Creates new farm.
		 *
		 * @example
		 * ```tsx
		 * const [createFarm, { isLoading }] = useCreateFarmMutation();
		 * await createFarm({ name: "Fazenda Santa Rita", totalArea: 1000, ... });
		 * ```
		 */
		createFarm: builder.mutation<Farm, CreateFarmRequest>({
			query: (body) => ({
				url: ROUTES.api.farms.base,
				method: HttpMethod.POST,
				body,
			}),
			transformResponse: (response: ApiResponse<Farm>) => response.data,
			invalidatesTags: [
				{ type: "Farm", id: "LIST" },
				{ type: "DashboardStats", id: "ALL" },
			],
		}),

		/**
		 * Updates existing farm.
		 *
		 * @example
		 * ```tsx
		 * const [updateFarm, { isLoading }] = useUpdateFarmMutation();
		 * await updateFarm({ id: farmId, name: "Fazenda Updated" });
		 * ```
		 */
		updateFarm: builder.mutation<Farm, { id: string } & UpdateFarmRequest>({
			query: ({ id, ...body }) => ({
				url: ROUTES.api.farms.byId(id),
				method: HttpMethod.PATCH,
				body,
			}),
			transformResponse: (response: ApiResponse<Farm>) => response.data,
			invalidatesTags: (result, error, { id }) => [
				{ type: "Farm", id },
				{ type: "Farm", id: "LIST" },
				{ type: "DashboardStats", id: "ALL" },
			],
		}),

		/**
		 * Deletes farm by ID.
		 *
		 * @example
		 * ```tsx
		 * const [deleteFarm, { isLoading }] = useDeleteFarmMutation();
		 * await deleteFarm(farmId);
		 * ```
		 */
		deleteFarm: builder.mutation<unknown, string>({
			query: (id) => ({
				url: ROUTES.api.farms.delete(id),
				method: HttpMethod.DELETE,
			}),
			transformResponse: (response: ApiResponse<unknown>) => response.data,
			invalidatesTags: (result, error, id) => [
				{ type: "Farm", id },
				{ type: "Farm", id: "LIST" },
				{ type: "DashboardStats", id: "ALL" },
			],
		}),
	}),
});

export const {
	useGetFarmsQuery,
	useGetFarmByIdQuery,
	useCreateFarmMutation,
	useUpdateFarmMutation,
	useDeleteFarmMutation,
} = farmsApi;
