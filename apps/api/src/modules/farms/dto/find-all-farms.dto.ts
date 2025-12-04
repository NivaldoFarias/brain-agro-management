import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

import { BrazilianState, FarmSortField, SortOrder } from "@agro/shared/enums";

/**
 * Query parameters for finding all farms with pagination, sorting, filtering, and search.
 *
 * Supports filtering farms by state, city, producer, and name search
 * with configurable pagination and sorting options.
 *
 * @example
 * ```typescript
 * // Get farms in São Paulo, sorted by total area descending
 * const query: FindAllFarmsDto = {
 *   page: 1,
 *   limit: 20,
 *   sortBy: FarmSortField.TotalArea,
 *   sortOrder: SortOrder.Descending,
 *   state: BrazilianState.SP,
 *   search: "Fazenda"
 * };
 * ```
 */
export class FindAllFarmsDto {
	/** Page number */
	@ApiPropertyOptional({
		description: "Page number",
		example: 1,
		minimum: 1,
		default: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: "Page must be an integer" })
	@Min(1, { message: "Page must be at least 1" })
	page?: number = 1;

	/** Number of items per page. Defaults to 10, max 100 */
	@ApiPropertyOptional({
		description: "Number of items per page",
		example: 10,
		minimum: 1,
		maximum: 100,
		default: 10,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: "Limit must be an integer" })
	@Min(1, { message: "Limit must be at least 1" })
	@Max(100, { message: "Limit cannot exceed 100" })
	limit?: number = 10;

	/** Field to sort by */
	@ApiPropertyOptional({
		description: "Field to sort by",
		default: FarmSortField.Name,
		enum: FarmSortField,
		examples: [FarmSortField.Name, FarmSortField.TotalArea, FarmSortField.CreatedAt],
		enumName: "FarmSortField",
	})
	@IsOptional()
	@IsEnum(FarmSortField, { message: "Invalid sort field" })
	sortBy?: string;

	/** Sort direction (ASC or DESC) */
	@ApiPropertyOptional({
		description: "Sort order direction",
		default: SortOrder.Ascending,
		enum: SortOrder,
		examples: [SortOrder.Ascending, SortOrder.Descending],
		enumName: "SortOrder",
	})
	@IsOptional()
	@IsEnum(SortOrder, { message: "Invalid sort order" })
	sortOrder?: string;

	/** Search query for farm name */
	@ApiPropertyOptional({
		description: "Search query for farm name (case-insensitive)",
		example: "Fazenda",
	})
	@IsOptional()
	@IsString({ message: "Search must be a string" })
	search?: string;

	/** Filter by Brazilian state */
	@ApiPropertyOptional({
		description: "Filter farms by state",
		enum: BrazilianState,
		example: BrazilianState.SP,
		enumName: "BrazilianState",
	})
	@IsOptional()
	@IsEnum(BrazilianState, { message: "Invalid state" })
	state?: string;

	/** Filter by city name */
	@ApiPropertyOptional({
		description: "Filter farms by city name (exact match)",
		example: "Campinas",
	})
	@IsOptional()
	@IsString({ message: "City must be a string" })
	city?: string;

	/** Filter by producer ID */
	@ApiPropertyOptional({
		description: "Filter farms by producer UUID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsOptional()
	@IsUUID("4", { message: "Producer ID must be a valid UUID" })
	producerId?: string;
}
