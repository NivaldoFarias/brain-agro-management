import { configureStore } from "@reduxjs/toolkit";

import type { Action, ThunkAction } from "@reduxjs/toolkit";

import { RuntimeEnvironment } from "@agro/shared";

import { env } from "@/utils";

import { farmsApi } from "./api/farms";
import { producersApi } from "./api/producers";

/**
 * Redux store configuration for Brain Agriculture application.
 *
 * Configures Redux Toolkit store with RTK Query API slices, middleware,
 * and DevTools integration for development.
 *
 * @see {@link https://redux-toolkit.js.org/api/configureStore|Redux Toolkit configureStore}
 * @see {@link https://redux-toolkit.js.org/rtk-query/overview|RTK Query Overview}
 */
export const store = configureStore({
	devTools: env.NODE_ENV !== RuntimeEnvironment.Production,
	reducer: {
		[producersApi.reducerPath]: producersApi.reducer,
		[farmsApi.reducerPath]: farmsApi.reducer,
	},
	middleware: (getDefaultMiddleware) => {
		return getDefaultMiddleware({
			serializableCheck: { ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"] },
		})
			.concat(producersApi.middleware)
			.concat(farmsApi.middleware);
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
