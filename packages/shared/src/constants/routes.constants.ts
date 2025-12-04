/**
 * Application route paths.
 *
 * Defines all frontend and API route paths used throughout the application.
 * This centralizes route management for consistency and ease of maintenance.
 */
export const ROUTE_PATHS = {
	home: "/",
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
	docs: "/docs",
	reference: "/reference",
	dashboardStats: "/dashboard/stats",
} as const;

/** Base API prefix used by all endpoints */
export const API_BASE = "/api" as const;

/**
 * Producer-related API endpoints.
 *
 * Handles CRUD operations for rural producers and agricultural companies.
 */
export const API_ROUTES_PRODUCERS = {
	/** Base path: `/api/producers` */
	base: `${API_BASE}${ROUTE_PATHS.producers}`,

	/** Get single producer: `/api/producers/:id` */
	byId: (id: string) => `${API_BASE}${ROUTE_PATHS.producers}/${id}` as const,

	/** Create producer: `POST /api/producers` */
	create: `${API_BASE}${ROUTE_PATHS.producers}`,

	/** Update producer: `PATCH /api/producers/:id` */
	update: (id: string) => `${API_BASE}${ROUTE_PATHS.producers}/${id}` as const,

	/** Delete producer: `DELETE /api/producers/:id` */
	delete: (id: string) => `${API_BASE}${ROUTE_PATHS.producers}/${id}` as const,

	/** List producers with pagination: `GET /api/producers?page=1&limit=10` */
	list: `${API_BASE}${ROUTE_PATHS.producers}`,
} as const;

/**
 * Farm-related API endpoints.
 *
 * Handles CRUD operations for agricultural properties and farms.
 */
export const API_ROUTES_FARMS = {
	/** Base path: `/api/farms` */
	base: `${API_BASE}${ROUTE_PATHS.farms}`,

	/** Get single farm: `/api/farms/:id` */
	byId: (id: string) => `${API_BASE}${ROUTE_PATHS.farms}/${id}` as const,

	/** Create farm: `POST /api/farms` */
	create: `${API_BASE}${ROUTE_PATHS.farms}`,

	/** Update farm: `PATCH /api/farms/:id` */
	update: (id: string) => `${API_BASE}${ROUTE_PATHS.farms}/${id}` as const,

	/** Delete farm: `DELETE /api/farms/:id` */
	delete: (id: string) => `${API_BASE}${ROUTE_PATHS.farms}/${id}` as const,

	/** List farms with pagination: `GET /api/farms?page=1&limit=10` */
	list: `${API_BASE}${ROUTE_PATHS.farms}`,

	/**
	 * Farm statistics endpoints for dashboard.
	 */
	stats: {
		/** Total farms and area: `GET /api/farms/stats/total-area` */
		totalArea: `${API_BASE}${ROUTE_PATHS.farmStatsTotalArea}`,

		/** Farms by state: `GET /api/farms/stats/by-state` */
		byState: `${API_BASE}${ROUTE_PATHS.farmStatsByState}`,

		/** Crop distribution: `GET /api/farms/stats/crops-distribution` */
		cropsDistribution: `${API_BASE}${ROUTE_PATHS.farmStatsCropsDistribution}`,

		/** Land use statistics: `GET /api/farms/stats/land-use` */
		landUse: `${API_BASE}${ROUTE_PATHS.farmStatsLandUse}`,
	},
} as const;

/**
 * Authentication-related API endpoints.
 *
 * Handles user authentication and authorization.
 */
export const API_ROUTES_AUTH = {
	/** Login endpoint: `POST /api/auth/login` */
	login: `${API_BASE}${ROUTE_PATHS.authLogin}`,

	/** Logout endpoint: `POST /api/auth/logout` */
	logout: `${API_BASE}${ROUTE_PATHS.authLogout}`,
} as const;

/**
 * Health check endpoints.
 *
 * Used for monitoring and liveness/readiness probes.
 */
export const API_ROUTES_HEALTH = {
	/** Basic health check: `GET /api/health` */
	health: `${API_BASE}${ROUTE_PATHS.health}`,

	/** Detailed readiness check: `GET /api/health/ready` */
	ready: `${API_BASE}${ROUTE_PATHS.healthReady}`,
} as const;

/**
 * Cities-related API endpoints.
 *
 * Provides Brazilian city data for form autocomplete and validation.
 */
export const API_ROUTES_CITIES = {
	/** Search cities by state: `GET /api/cities?state=SP` */
	search: `${API_BASE}${ROUTE_PATHS.cities}`,

	/** Get cities by state: `GET /api/cities/:state` */
	byState: (state: string) => `${API_BASE}${ROUTE_PATHS.cities}/${state}` as const,

	count: `${API_BASE}${ROUTE_PATHS.citiesCount}`,

	byIbgeCode: (ibgeCode: string) =>
		`${API_BASE}${ROUTE_PATHS.citiesByIbgeCode}/${ibgeCode}` as const,
} as const;

/**
 * Documentation-related API endpoints.
 *
 * Provides access to API documentation and reference materials.
 */
export const API_ROUTES_DOCS = {
	/** Swagger API documentation: `GET /api/docs` */
	docs: `${API_BASE}${ROUTE_PATHS.docs}`,

	/** Scalar API Reference: `GET /api/reference` */
	reference: `${API_BASE}${ROUTE_PATHS.reference}`,
} as const;

export const API_ROUTES_DASHBOARD = {} as const;

/**
 * Consolidated API routes object.
 *
 * Provides all API endpoints in a single export for convenience.
 *
 * @example
 * ```typescript
 * import { API_ROUTES } from '@agro/shared/types';
 *
 * const producerUrl = API_ROUTES.producers.byId('uuid');
 * const statsUrl = API_ROUTES.farms.stats.totalArea;
 * ```
 */
export const API_ROUTES = {
	base: API_BASE,
	producers: API_ROUTES_PRODUCERS,
	farms: API_ROUTES_FARMS,
	auth: API_ROUTES_AUTH,
	health: API_ROUTES_HEALTH,
	cities: API_ROUTES_CITIES,
	docs: API_ROUTES_DOCS,
} as const;
