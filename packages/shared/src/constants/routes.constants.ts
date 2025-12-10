/** Base API prefix for backend endpoints */
const API_PREFIX = "/api" as const;

/**
 * Unified route constants for Brain Agriculture application.
 *
 * Centralized route definitions for both API endpoints and web client navigation.
 * Provides type-safe route access with clear separation between backend and frontend.
 *
 * @example
 * ```typescript
 * import { ROUTES } from '@agro/shared/constants';
 *
 * // API usage
 * const url = ROUTES.api.producers.byId('uuid-123');
 * // => '/api/producers/uuid-123'
 *
 * // Web navigation usage
 * navigate(ROUTES.web.producers.edit('uuid-123'));
 * // => '/producers/uuid-123/edit'
 * ```
 */
export const ROUTES = {
	/**
	 * Backend API endpoints.
	 *
	 * Full URLs including `/api` prefix for HTTP requests.
	 */
	api: {
		/** Base API prefix: `/api` */
		base: API_PREFIX,

		/**
		 * Producer-related endpoints.
		 *
		 * Handles CRUD operations for rural producers.
		 */
		producers: {
			/** List/create producers: `GET|POST /api/producers` */
			base: `${API_PREFIX}/producers`,

			/** Get single producer: `GET /api/producers/:id` */
			byId: (id: string) => `${API_PREFIX}/producers/${id}` as const,

			/** Create producer: `POST /api/producers` */
			create: `${API_PREFIX}/producers`,

			/** Update producer: `PATCH /api/producers/:id` */
			update: (id: string) => `${API_PREFIX}/producers/${id}` as const,

			/** Delete producer: `DELETE /api/producers/:id` */
			delete: (id: string) => `${API_PREFIX}/producers/${id}` as const,
		},

		/**
		 * Farm-related endpoints.
		 *
		 * Handles CRUD operations for farms and statistics.
		 */
		farms: {
			/** List/create farms: `GET|POST /api/farms` */
			base: `${API_PREFIX}/farms`,

			/** Get single farm: `GET /api/farms/:id` */
			byId: (id: string) => `${API_PREFIX}/farms/${id}` as const,

			/** Create farm: `POST /api/farms` */
			create: `${API_PREFIX}/farms`,

			/** Update farm: `PATCH /api/farms/:id` */
			update: (id: string) => `${API_PREFIX}/farms/${id}` as const,

			/** Delete farm: `DELETE /api/farms/:id` */
			delete: (id: string) => `${API_PREFIX}/farms/${id}` as const,

			/** Farm statistics for dashboard */
			stats: {
				/** Total farms and area: `GET /api/farms/stats/total-area` */
				totalArea: `${API_PREFIX}/farms/stats/total-area`,

				/** Farms grouped by state: `GET /api/farms/stats/by-state` */
				byState: `${API_PREFIX}/farms/stats/by-state`,

				/** Crop distribution: `GET /api/farms/stats/crops-distribution` */
				cropsDistribution: `${API_PREFIX}/farms/stats/crops-distribution`,

				/** Land use breakdown: `GET /api/farms/stats/land-use` */
				landUse: `${API_PREFIX}/farms/stats/land-use`,
			},
		},

		/**
		 * Authentication endpoints.
		 */
		auth: {
			/** Login: `POST /api/auth/login` */
			login: `${API_PREFIX}/auth/login`,

			/** Logout: `POST /api/auth/logout` */
			logout: `${API_PREFIX}/auth/logout`,
		},

		/**
		 * Brazilian cities data endpoints.
		 */
		cities: {
			/** Search cities: `GET /api/cities` */
			base: `${API_PREFIX}/cities`,

			/** Get cities by state: `GET /api/cities/:state` */
			byState: (state: string) => `${API_PREFIX}/cities/${state}` as const,

			/** Get total cities count: `GET /api/cities/count` */
			count: `${API_PREFIX}/cities/count`,

			/** Get city by IBGE code: `GET /api/cities/by-ibge-code/:code` */
			byIbgeCode: (ibgeCode: string) => `${API_PREFIX}/cities/by-ibge-code/${ibgeCode}` as const,

			/** Get all cities grouped by state: `GET /api/cities/all/grouped-by-state` */
			groupedByState: `${API_PREFIX}/cities/all/grouped-by-state`,
		},

		/**
		 * Dashboard statistics endpoints.
		 */
		dashboard: {
			/** Get all dashboard stats: `GET /api/dashboard/stats` */
			stats: `${API_PREFIX}/dashboard/stats`,
		},

		/**
		 * Health check endpoints for monitoring.
		 */
		health: {
			/** Basic health check: `GET /api/health` */
			base: `${API_PREFIX}/health`,

			/** Detailed readiness check: `GET /api/health/ready` */
			ready: `${API_PREFIX}/health/ready`,
		},

		/**
		 * API documentation endpoints.
		 */
		docs: {
			/** Swagger UI: `GET /api/docs` */
			swagger: `${API_PREFIX}/docs`,

			/** Scalar API reference: `GET /api/reference` */
			reference: `${API_PREFIX}/reference`,
		},
	},

	/**
	 * Frontend web application routes.
	 *
	 * Navigation paths for React Router (no `/api` prefix).
	 */
	web: {
		/** Home page: `/` */
		home: "/",

		/** Dashboard overview: `/dashboard` */
		dashboard: "/dashboard",

		/**
		 * Authentication routes.
		 */
		auth: {
			/** Login page: `/login` */
			login: "/login",
		},

		/**
		 * Producer management routes.
		 */
		producers: {
			/** Producer list page: `/producers` */
			list: "/producers",

			/** Create new producer: `/producers/new` */
			create: "/producers/new",

			/** Edit producer: `/producers/:id/edit` */
			edit: (id: string) => `/producers/${id}/edit` as const,

			/** View producer details: `/producers/:id` */
			view: (id: string) => `/producers/${id}` as const,
		},

		/**
		 * Farm management routes.
		 */
		farms: {
			/** Farm list page: `/farms` */
			list: "/farms",

			/** Create new farm: `/farms/new` */
			create: "/farms/new",

			/** Edit farm: `/farms/:id/edit` */
			edit: (id: string) => `/farms/${id}/edit` as const,

			/** View farm details: `/farms/:id` */
			view: (id: string) => `/farms/${id}` as const,
		},
	},
} as const;

// ============================================================================
// Legacy exports for backward compatibility
// @deprecated Use `ROUTES.api.*` instead
// ============================================================================

/** @deprecated Use `ROUTES.api.base` instead */
export const API_BASE = ROUTES.api.base;

/** @deprecated Use `ROUTES.api.*` instead */
export const API_ROUTES = ROUTES.api;

/** @deprecated Use `ROUTES.web.*` or `ROUTES.api.*` instead */
export const ROUTE_PATHS = {
	home: ROUTES.web.home,
	producers: "/producers",
	farms: "/farms",
	farmStatsTotalArea: "/farms/stats/total-area",
	farmStatsByState: "/farms/stats/by-state",
	farmStatsCropsDistribution: "/farms/stats/crops-distribution",
	farmStatsLandUse: "/farms/stats/land-use",
	authLogin: "/auth/login",
	authLogout: "/auth/logout",
	health: "/health",
	healthReady: "/health/ready",
	cities: "/cities",
	citiesCount: "/cities/count",
	citiesByIbgeCode: "/cities/by-ibge-code",
	citiesGroupedByState: "/cities/all/grouped-by-state",
	docs: "/docs",
	reference: "/reference",
	dashboardStats: "/dashboard/stats",
} as const;
