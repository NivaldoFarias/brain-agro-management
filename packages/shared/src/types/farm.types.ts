import type { BrazilianState, CropType } from "../utils/constants.util";

/**
 * Farm entity type representing agricultural properties.
 *
 * A farm is an agricultural property owned by a producer. It contains information
 * about location, area distribution, and cultivated crops. Area validation ensures
 * that arable + vegetation areas do not exceed total area.
 *
 * @example
 * ```typescript
 * const farm: Farm = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "Fazenda Boa Vista",
 *   city: "Campinas",
 *   state: "SP",
 *   totalArea: 100.5,
 *   arableArea: 70.0,
 *   vegetationArea: 25.0,
 *   crops: ["soy", "corn"],
 *   producerId: "producer-uuid",
 *   createdAt: "2024-01-15T10:30:00.000Z",
 *   updatedAt: "2024-01-15T10:30:00.000Z"
 * };
 * ```
 */
export interface Farm {
	/** Unique identifier (UUID v4) */
	id: string;

	/** Name of the farm */
	name: string;

	/**
	 * City where the farm is located.
	 *
	 * Must be a valid Brazilian municipality within the specified state.
	 * Validated against IBGE data.
	 */
	city: string;

	/**
	 * Brazilian state (UF) where the farm is located.
	 *
	 * Must be one of the 27 valid Brazilian state codes.
	 *
	 * @see {@link BrazilianState}
	 */
	state: BrazilianState;

	/**
	 * Total area of the farm in hectares.
	 *
	 * Must be greater than zero. The sum of arableArea and vegetationArea
	 * cannot exceed this value.
	 *
	 * @minimum `0.01`
	 */
	totalArea: number;

	/**
	 * Arable area (área agricultável) in hectares.
	 *
	 * Land area suitable for cultivation. Must be non-negative and cannot
	 * exceed totalArea when combined with vegetationArea.
	 *
	 * @minimum `0`
	 */
	arableArea: number;

	/**
	 * Vegetation/preservation area in hectares.
	 *
	 * Protected or preserved natural vegetation area. Must be non-negative
	 * and cannot exceed totalArea when combined with arableArea.
	 *
	 * @minimum `0`
	 */
	vegetationArea: number;

	/**
	 * Array of crop types cultivated on this farm.
	 *
	 * @see {@link CropType}
	 */
	crops: Array<CropType>;

	/**
	 * UUID of the producer who owns this farm.
	 *
	 * References an existing producer in the database.
	 */
	producerId: string;

	/** Timestamp when the farm was created */
	createdAt: string;

	/** Timestamp when the farm was last updated */
	updatedAt: string;
}

/**
 * Request payload for creating a new farm.
 *
 * @example
 * ```typescript
 * const request: CreateFarmRequest = {
 *   name: "Fazenda Boa Vista",
 *   city: "Campinas",
 *   state: "SP",
 *   totalArea: 100.5,
 *   arableArea: 70.0,
 *   vegetationArea: 25.0,
 *   crops: ["soy", "corn"],
 *   producerId: "550e8400-e29b-41d4-a716-446655440000"
 * };
 * ```
 */
export interface CreateFarmRequest {
	/**
	 * Name of the farm.
	 *
	 * @minLength `3`
	 * @maxLength `255`
	 * @example "Fazenda Boa Vista"
	 */
	name: string;

	/**
	 * City where the farm is located.
	 *
	 * Must be a valid Brazilian municipality within the specified state.
	 *
	 * @minLength `2`
	 * @maxLength `100`
	 * @example "Campinas"
	 */
	city: string;

	/**
	 * Brazilian state (UF) where the farm is located.
	 *
	 * @example "SP"
	 * @see {@link BrazilianState}
	 */
	state: BrazilianState;

	/**
	 * Total area of the farm in hectares.
	 *
	 * @minimum `0.01`
	 * @example 100.5
	 */
	totalArea: number;

	/**
	 * Arable area in hectares.
	 *
	 * @minimum `0`
	 * @example 70.0
	 */
	arableArea: number;

	/**
	 * Vegetation/preservation area in hectares.
	 *
	 * @minimum `0`
	 * @example 25.0
	 */
	vegetationArea: number;

	/**
	 * Array of crop types cultivated on this farm.
	 *
	 * @example ["soy", "corn"]
	 * @see {@link CropType}
	 */
	crops: Array<CropType>;

	/**
	 * UUID of the producer who owns this farm.
	 *
	 * @format uuid
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	producerId: string;
}

/**
 * Request payload for updating an existing farm.
 *
 * All fields are optional - only provided fields will be updated.
 *
 * @example
 * ```typescript
 * const request: UpdateFarmRequest = {
 *   name: "Fazenda Boa Vista (Updated)",
 *   totalArea: 105.0
 * };
 * ```
 */
export interface UpdateFarmRequest {
	/**
	 * Name of the farm.
	 *
	 * @minLength `3`
	 * @maxLength `255`
	 */
	name?: string;

	/**
	 * City where the farm is located.
	 *
	 * @minLength `2`
	 * @maxLength `100`
	 */
	city?: string;

	/** Brazilian state (UF) where the farm is located */
	state?: BrazilianState;

	/**
	 * Total area of the farm in hectares.
	 *
	 * @minimum `0.01`
	 */
	totalArea?: number;

	/**
	 * Arable area in hectares.
	 *
	 * @minimum `0`
	 */
	arableArea?: number;

	/**
	 * Vegetation/preservation area in hectares.
	 *
	 * @minimum `0`
	 */
	vegetationArea?: number;

	/** Array of crop types cultivated on this farm */
	crops?: Array<CropType>;
}

/**
 * Paginated response for farm list queries.
 *
 * @example
 * ```typescript
 * const response: FarmsListResponse = {
 *   data: [farm1, farm2],
 *   total: 50,
 *   page: 1,
 *   limit: 10
 * };
 * ```
 */
export interface FarmsListResponse {
	/** Array of farm entities */
	data: Array<Farm>;

	/** Total count of farms matching the query */
	total: number;

	/** Current page number (1-indexed) */
	page: number;

	/** Number of items per page */
	limit: number;
}

/**
 * Query parameters for listing farms.
 *
 * @example
 * ```typescript
 * const params: FarmsListQuery = {
 *   page: 1,
 *   limit: 10
 * };
 * ```
 */
export interface FarmsListQuery {
	/**
	 * Page number (1-indexed).
	 *
	 * @default 1
	 * @minimum `1`
	 */
	page?: number;

	/**
	 * Number of items per page.
	 *
	 * @default 10
	 * @minimum `1`
	 * @maximum `100`
	 */
	limit?: number;
}
