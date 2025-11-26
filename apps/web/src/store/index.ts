import { configureStore } from "@reduxjs/toolkit";

import type { Action, ThunkAction } from "@reduxjs/toolkit";

import { RuntimeEnvironment } from "@agro/shared/utils/constants.util";

import { env } from "@/utils";

import { api } from "./api";

/**
 * Redux store configuration for Brain Agriculture application.
 *
 * Configures Redux Toolkit store with RTK Query API slice, middleware,
 * and DevTools integration for development. The API slice is injected
 * with endpoints from producersApi, farmsApi, and dashboardApi.
 *
 * @see {@link https://redux-toolkit.js.org/api/configureStore|Redux Toolkit configureStore}
 * @see {@link https://redux-toolkit.js.org/rtk-query/overview|RTK Query Overview}
 */
export const store = configureStore({
	devTools: env.NODE_ENV !== RuntimeEnvironment.Production,
	reducer: {
		[api.reducerPath]: api.reducer,
	},
	middleware: (getDefaultMiddleware) => {
		return getDefaultMiddleware({
			serializableCheck: { ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"] },
		}).concat(api.middleware);
	},
});

/**
 * Root state type inferred from the store.
 *
 * Use this type when selecting state with `useAppSelector`.
 *
 * @example
 * ```typescript
 * const producers = useAppSelector((state: RootState) => state.producers);
 * ```
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Dispatch type inferred from the store.
 *
 * Use this type when dispatching actions with `useAppDispatch`.
 *
 * @example
 * ```typescript
 * const dispatch = useAppDispatch();
 * dispatch(createProducer(producerData));
 * ```
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Thunk action type for async operations.
 *
 * Use this type when creating thunk actions with `createAsyncThunk`.
 *
 * @example
 * ```typescript
 * export const fetchProducers = createAsyncThunk<Producer[], void, { state: RootState }>(
 *   'producers/fetch',
 *   async () => { ... }
 * );
 * ```
 */
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;
