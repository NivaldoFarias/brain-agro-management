/** Base API prefix used by all endpoints */
export const API_BASE = "/api" as const;

/**
 * Producer-related API endpoints.
 *
 * Handles CRUD operations for rural producers and agricultural companies.
 */
export const API_ROUTES_PRODUCERS = {
	/** Base path: `/api/producers` */
	base: `${API_BASE}/producers`,

	/** Get single producer: `/api/producers/:id` */
	byId: (id: string) => `${API_BASE}/producers/${id}` as const,

	/** Create producer: `POST /api/producers` */
	create: `${API_BASE}/producers`,

	/** Update producer: `PATCH /api/producers/:id` */
	update: (id: string) => `${API_BASE}/producers/${id}` as const,

	/** Delete producer: `DELETE /api/producers/:id` */
	delete: (id: string) => `${API_BASE}/producers/${id}` as const,

	/** List producers with pagination: `GET /api/producers?page=1&limit=10` */
	list: `${API_BASE}/producers`,
} as const;

/**
 * Farm-related API endpoints.
 *
 * Handles CRUD operations for agricultural properties and farms.
 */
export const API_ROUTES_FARMS = {
	/** Base path: `/api/farms` */
	base: `${API_BASE}/farms`,

	/** Get single farm: `/api/farms/:id` */
	byId: (id: string) => `${API_BASE}/farms/${id}` as const,

	/** Create farm: `POST /api/farms` */
	create: `${API_BASE}/farms`,

	/** Update farm: `PATCH /api/farms/:id` */
	update: (id: string) => `${API_BASE}/farms/${id}` as const,

	/** Delete farm: `DELETE /api/farms/:id` */
	delete: (id: string) => `${API_BASE}/farms/${id}` as const,

	/** List farms with pagination: `GET /api/farms?page=1&limit=10` */
	list: `${API_BASE}/farms`,

	/**
	 * Farm statistics endpoints for dashboard.
	 */
	stats: {
		/** Total farms and area: `GET /api/farms/stats/total-area` */
		totalArea: `${API_BASE}/farms/stats/total-area`,

		/** Farms by state: `GET /api/farms/stats/by-state` */
		byState: `${API_BASE}/farms/stats/by-state`,

		/** Crop distribution: `GET /api/farms/stats/crops-distribution` */
		cropsDistribution: `${API_BASE}/farms/stats/crops-distribution`,

		/** Land use statistics: `GET /api/farms/stats/land-use` */
		landUse: `${API_BASE}/farms/stats/land-use`,
	},
} as const;

/**
 * Authentication-related API endpoints.
 *
 * Handles user authentication and authorization.
 */
export const API_ROUTES_AUTH = {
	/** Login endpoint: `POST /api/auth/login` */
	login: `${API_BASE}/auth/login`,

	/** Logout endpoint: `POST /api/auth/logout` */
	logout: `${API_BASE}/auth/logout`,
} as const;

/**
 * Health check endpoints.
 *
 * Used for monitoring and liveness/readiness probes.
 */
export const API_ROUTES_HEALTH = {
	/** Basic health check: `GET /health` */
	health: "/health",

	/** Detailed readiness check: `GET /health/ready` */
	ready: "/health/ready",
} as const;

/**
 * Cities-related API endpoints.
 *
 * Provides Brazilian city data for form autocomplete and validation.
 */
export const API_ROUTES_CITIES = {
	/** Search cities by state: `GET /api/cities?state=SP` */
	search: `${API_BASE}/cities`,

	/** Get cities by state: `GET /api/cities/:state` */
	byState: (state: string) => `${API_BASE}/cities/${state}` as const,
} as const;

/**
 * Documentation-related API endpoints.
 *
 * Provides access to API documentation and reference materials.
 */
export const API_ROUTES_DOCS = {
	/** Swagger API documentation: `GET /api/docs` */
	docs: `${API_BASE}/docs`,

	/** Scalar API Reference: `GET /api/reference` */
	reference: `${API_BASE}/reference`,
} as const;

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
