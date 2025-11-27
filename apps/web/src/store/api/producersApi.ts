import type {
	ApiResponse,
	CreateProducerRequest,
	Producer,
	ProducersListQuery,
	ProducersListResponse,
	UpdateProducerRequest,
} from "@agro/shared/types";

import { HttpMethod } from "@agro/shared/utils";

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
		 * Fetches paginated list of producers.
		 *
		 * @example
		 * ```tsx
		 * const { data, isLoading } = useGetProducersQuery({ page: 1, limit: 10 });
		 * ```
		 */
		getProducers: builder.query<ProducersListResponse, ProducersListQuery>({
			query: ({ page = 1, limit = 10 } = {}) => ({
				url: "/producers",
				params: { page, limit },
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
			query: (id) => `/producers/${id}`,
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
				url: "/producers",
				method: HttpMethod.POST,
				body,
			}),
			transformResponse: (response: ApiResponse<Producer>) => response.data,
			invalidatesTags: [{ type: "Producer", id: "LIST" }],
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
				url: `/producers/${id}`,
				method: "PATCH",
				body,
			}),
			transformResponse: (response: ApiResponse<Producer>) => response.data,
			invalidatesTags: (result, error, { id }) => [
				{ type: "Producer", id },
				{ type: "Producer", id: "LIST" },
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
				url: `/producers/${id}`,
				method: "DELETE",
			}),
			transformResponse: (response: ApiResponse<unknown>) => response.data,
			invalidatesTags: (result, error, id) => [
				{ type: "Producer", id },
				{ type: "Producer", id: "LIST" },
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
