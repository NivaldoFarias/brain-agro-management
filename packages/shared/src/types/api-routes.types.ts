/**
 * Centralized API routes and endpoint paths for Brain Agriculture application.
 *
 * This module provides constants for all API endpoints to ensure consistency
 * between frontend and backend route definitions. All routes are prefixed with
 * `/api` as configured in the NestJS global prefix.
 *
 * @example
 * ```typescript
 * import { API_ROUTES } from '@agro/shared/types';
 *
 * // Backend usage (NestJS)
 * fetch(`${API_ROUTES.producers.base}/${producerId}`);
 *
 * // Frontend usage (RTK Query)
 * query: () => API_ROUTES.producers.base
 * ```
 */

import type {
	API_BASE,
	API_ROUTES_AUTH,
	API_ROUTES_CITIES,
	API_ROUTES_FARMS,
	API_ROUTES_HEALTH,
	API_ROUTES_PRODUCERS,
} from "@/constants/routes";

/**
 * Type representing all possible API route paths.
 *
 * Useful for type-safe route handling and validation.
 */
export type ApiRoutePath =
	| typeof API_BASE
	| (typeof API_ROUTES_PRODUCERS)[keyof typeof API_ROUTES_PRODUCERS]
	| (typeof API_ROUTES_FARMS)[keyof typeof API_ROUTES_FARMS]
	| (typeof API_ROUTES_AUTH)[keyof typeof API_ROUTES_AUTH]
	| (typeof API_ROUTES_HEALTH)[keyof typeof API_ROUTES_HEALTH]
	| (typeof API_ROUTES_CITIES)[keyof typeof API_ROUTES_CITIES];
