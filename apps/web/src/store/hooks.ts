import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./index";
import type { TypedUseSelectorHook } from "react-redux";

/**
 * Typed version of `useDispatch` hook for Redux store.
 *
 * Use this instead of plain `useDispatch` to get proper TypeScript types
 * for dispatching actions and thunks.
 *
 * @example
 * ```typescript
 * const dispatch = useAppDispatch();
 * dispatch(createProducer(producerData));
 * ```
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

/**
 * Typed version of `useSelector` hook for Redux store.
 *
 * Use this instead of plain `useSelector` to get proper TypeScript types
 * for selecting state from the Redux store.
 *
 * @example
 * ```typescript
 * const producers = useAppSelector((state) => state.producers);
 * ```
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
