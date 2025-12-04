import type { Response } from "supertest";

import type { BrazilianState } from "@agro/shared/utils";

import type { CreateFarmDto, FarmResponseDto, UpdateFarmDto } from "@/modules/farms/dto";

import { BaseScenario, TypedResponse } from "./base.scenario";

/**Stats response for total area endpoint */
export interface TotalAreaStatsDto {
	/** Total number of farms */
	totalFarms: number;

	/** Total hectares across all farms */
	totalHectares: number;
}

/** Stats response for farms by state endpoint */
export interface FarmsByStateDto {
	/** State abbreviation */
	state: BrazilianState;

	/** Number of farms in the state */
	count: number;
}

/** Stats response for land use endpoint */
export interface LandUseStatsDto {
	/** Total arable area across all farms */
	arableArea: number;

	/** Total vegetation area across all farms */
	vegetationArea: number;
}

/**
 * Type-safe scenario builder for farm-related E2E test operations.
 *
 * Provides strongly-typed methods for all farm API endpoints including CRUD
 * operations and statistics endpoints. Eliminates manual type assertions and
 * reduces test boilerplate with full TypeScript inference.
 *
 * @example
 * ```typescript
 * describe('Farms E2E', () => {
 *   let scenario: FarmsScenario;
 *
 *   beforeAll(() => {
 *     scenario = new FarmsScenario(server);
 *   });
 *
 *   it('should create farm', async () => {
 *     const response = await scenario.create({
 *       name: 'Fazenda Boa Vista',
 *       city: 'Campinas',
 *       state: BrazilianState.SP,
 *       totalArea: 100,
 *       arableArea: 70,
 *       vegetationArea: 25,
 *       producerId: '550e8400...'
 *     });
 *     expect(response.body.id).toBeDefined();
 *   });
 * });
 * ```
 */
export class FarmsScenario extends BaseScenario {
	/** Base path for all farm endpoints */
	private readonly route = "/farms";

	/** The full API path for farm endpoints */
	get path(): string {
		return this.basePath + this.route;
	}

	/**
	 * Creates a new farm.
	 *
	 * @param data Farm creation data
	 *
	 * @returns Promise resolving to typed response with created farm
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.create({
	 *   name: 'Fazenda Boa Vista',
	 *   city: 'Campinas',
	 *   state: BrazilianState.SP,
	 *   totalArea: 100,
	 *   arableArea: 70,
	 *   vegetationArea: 25,
	 *   producerId: producerId
	 * });
	 * expect(response.status).toBe(201);
	 * ```
	 */
	async create(data: CreateFarmDto): Promise<TypedResponse<FarmResponseDto>> {
		return this.post<FarmResponseDto>(this.path, data);
	}

	/**
	 * Retrieves all farms.
	 *
	 * @returns Promise resolving to typed response with farm array
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.findAll();
	 * expect(response.status).toBe(200);
	 * expect(Array.isArray(response.body)).toBe(true);
	 * ```
	 */
	async findAll(): Promise<TypedResponse<Array<FarmResponseDto>>> {
		return this.get<Array<FarmResponseDto>>(this.path);
	}

	/**
	 * Retrieves a single farm by ID.
	 *
	 * @param id Farm UUID
	 *
	 * @returns Promise resolving to typed response with farm data
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.findById(farmId);
	 * expect(response.status).toBe(200);
	 * expect(response.body.name).toBe('Fazenda Boa Vista');
	 * ```
	 */
	async findById(id: string): Promise<TypedResponse<FarmResponseDto>> {
		return this.get<FarmResponseDto>(`${this.path}/${id}`);
	}

	/**
	 * Updates an existing farm.
	 *
	 * @param id Farm UUID
	 * @param data Partial farm data to update
	 *
	 * @returns Promise resolving to typed response with updated farm
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.update(farmId, {
	 *   name: 'Updated Farm Name'
	 * });
	 * expect(response.body.name).toBe('Updated Farm Name');
	 * ```
	 */
	async update(id: string, data: UpdateFarmDto): Promise<TypedResponse<FarmResponseDto>> {
		return this.patch<FarmResponseDto>(`${this.path}/${id}`, data);
	}

	/**
	 * Deletes a farm.
	 *
	 * @param id Farm UUID
	 *
	 * @returns Promise resolving to supertest response
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.remove(farmId);
	 * expect(response.status).toBe(204);
	 * ```
	 */
	async remove(id: string): Promise<Response> {
		return this.delete(`${this.path}/${id}`);
	}

	/**
	 * Retrieves total farms count and hectares statistics.
	 *
	 * @returns Promise resolving to typed response with aggregated stats
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.getTotalAreaStats();
	 * expect(response.body.totalFarms).toBe(10);
	 * expect(response.body.totalHectares).toBe(1500.5);
	 * ```
	 */
	async getTotalAreaStats(): Promise<TypedResponse<TotalAreaStatsDto>> {
		return this.get<TotalAreaStatsDto>(`${this.path}/stats/total-area`);
	}

	/**
	 * Retrieves farms grouped by Brazilian state.
	 *
	 * @returns Promise resolving to typed response with state distribution
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.getFarmsByState();
	 * expect(response.body).toEqual([
	 *   { state: 'SP', count: 5 },
	 *   { state: 'MG', count: 3 }
	 * ]);
	 * ```
	 */
	async getFarmsByState(): Promise<TypedResponse<Array<FarmsByStateDto>>> {
		return this.get<Array<FarmsByStateDto>>(`${this.path}/stats/by-state`);
	}

	/**
	 * Retrieves land use statistics (arable vs vegetation areas).
	 *
	 * @returns Promise resolving to typed response with land use breakdown
	 *
	 * @example
	 * ```typescript
	 * const response = await scenario.getLandUseStats();
	 * expect(response.body.arableArea).toBe(800);
	 * expect(response.body.vegetationArea).toBe(200);
	 * ```
	 */
	async getLandUseStats(): Promise<TypedResponse<LandUseStatsDto>> {
		return this.get<LandUseStatsDto>(`${this.path}/stats/land-use`);
	}
}
