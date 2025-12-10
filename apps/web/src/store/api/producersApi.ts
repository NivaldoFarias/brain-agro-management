import type {
	ApiResponse,
	CreateProducerRequest,
	Producer,
	ProducersFilterOptions,
	ProducersListResponse,
	UpdateProducerRequest,
} from "@agro/shared/types";

import { ROUTES } from "@agro/shared/constants";
import { HttpMethod } from "@agro/shared/enums";

import { api } from "./baseApi";

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
		getProducers: builder.query<ProducersListResponse, ProducersFilterOptions>({
			query: ({ page = 1, limit = 10, sortBy, sortOrder, search } = {}) => ({
				url: ROUTES.api.producers.base,
				params: {
					page,
					limit,
					...(sortBy && { sortBy }),
					...(sortOrder && { sortOrder }),
					...(search && { search }),
				},
			}),
			transformResponse: (response: ApiResponse<ProducersListResponse>): ProducersListResponse =>
				response.data,
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
		 * const { data, isLoading } = useGetProducerByIdQuery(producerId);
		 * ```
		 */
		getProducerById: builder.query<Producer, string>({
			query: (id) => ROUTES.api.producers.byId(id),
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
				url: ROUTES.api.producers.base,
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
				url: ROUTES.api.producers.update(id),
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
				url: ROUTES.api.producers.delete(id),
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
	useGetProducerByIdQuery,
	useCreateProducerMutation,
	useUpdateProducerMutation,
	useDeleteProducerMutation,
} = producersApi;
