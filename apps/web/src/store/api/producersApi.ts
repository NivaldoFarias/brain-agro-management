import type {
	ApiResponse,
	CreateProducerRequest,
	Producer,
	ProducersListQuery,
	ProducersListResponse,
	UpdateProducerRequest,
} from "@agro/shared/types";

import { HttpMethod } from "@agro/shared/enums";

import { api } from "./baseApi";
import { ROUTE_PATHS } from "@agro/shared/constants";

/**
 * Producers API endpoints using RTK Query.
 *
 * Provides auto-generated hooks for CRUD operations on producers
 * with automatic caching and cache invalidation.
 */
export const producersApi = api.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Fetches paginated list of producers with sorting and search.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetProducersQuery({
		 *   page: 1,
		 *   limit: 10,
		 *   sortBy: "name",
		 *   sortOrder: "ASC",
		 *   search: "Silva"
		 * });
		 * ```
		 */
		getProducers: builder.query<ProducersListResponse, ProducersListQuery>({
			query: ({ page = 1, limit = 10, sortBy, sortOrder, search } = {}) => ({
				url: ROUTE_PATHS.producers,
				params: {
					page,
					limit,
					...(sortBy && { sortBy }),
					...(sortOrder && { sortOrder }),
					...(search && { search }),
				},
			}),
			transformResponse: (response: ApiResponse<ProducersListResponse>) => response.data,
			providesTags: (result) =>
				result ?
					[
						...result.data.map(({ id }) => ({ type: "Producer" as const, id })),
						{ type: "Producer", id: "LIST" },
					]
				:	[{ type: "Producer", id: "LIST" }],
		}),

		/**
		 * Fetches single producer by ID.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetProducerQuery(producerId);
		 * ```
		 */
		getProducer: builder.query<Producer, string>({
			query: (id) => `${ROUTE_PATHS.producers}/${id}`,
			transformResponse: (response: ApiResponse<Producer>) => response.data,
			providesTags: (result, error, id) => [{ type: "Producer", id }],
		}),

		/**
		 * Creates new producer.
		 *
		 * @example
		 * ```tsx
		 * const [createProducer, { isLoading }] = useCreateProducerMutation();
		 * await createProducer({ name: "João Silva", cpfCnpj: "123.456.789-00", ... });
		 * ```
		 */
		createProducer: builder.mutation<Producer, CreateProducerRequest>({
			query: (body) => ({
				url: ROUTE_PATHS.producers,
				method: HttpMethod.POST,
				body,
			}),
			transformResponse: (response: ApiResponse<Producer>) => response.data,
			invalidatesTags: [
				{ type: "Producer", id: "LIST" },
				{ type: "DashboardStats", id: "ALL" },
			],
		}),

		/**
		 * Updates existing producer.
		 *
		 * @example
		 * ```tsx
		 * const [updateProducer, { isLoading }] = useUpdateProducerMutation();
		 * await updateProducer({ id: producerId, name: "João Updated" });
		 * ```
		 */
		updateProducer: builder.mutation<Producer, { id: string } & UpdateProducerRequest>({
			query: ({ id, ...body }) => ({
				url: `${ROUTE_PATHS.producers}/${id}`,
				method: HttpMethod.PATCH,
				body,
			}),
			transformResponse: (response: ApiResponse<Producer>) => response.data,
			invalidatesTags: (result, error, { id }) => [
				{ type: "Producer", id },
				{ type: "Producer", id: "LIST" },
				{ type: "DashboardStats", id: "ALL" },
			],
		}),

		/**
		 * Deletes producer by ID.
		 *
		 * @example
		 * ```tsx
		 * const [deleteProducer, { isLoading }] = useDeleteProducerMutation();
		 * await deleteProducer(producerId);
		 * ```
		 */
		deleteProducer: builder.mutation<unknown, string>({
			query: (id) => ({
				url: `${ROUTE_PATHS.producers}/${id}`,
				method: HttpMethod.DELETE,
			}),
			transformResponse: (response: ApiResponse<unknown>) => response.data,
			invalidatesTags: (result, error, id) => [
				{ type: "Producer", id },
				{ type: "Producer", id: "LIST" },
				{ type: "DashboardStats", id: "ALL" },
			],
		}),
	}),
});

export const {
	useGetProducersQuery,
	useGetProducerQuery,
	useCreateProducerMutation,
	useUpdateProducerMutation,
	useDeleteProducerMutation,
} = producersApi;
