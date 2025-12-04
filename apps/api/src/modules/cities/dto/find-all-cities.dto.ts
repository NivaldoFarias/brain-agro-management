import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

import { BrazilianState, CitySortField, SortOrder } from "@agro/shared/enums";

/**
 * Query parameters for finding all cities with pagination, sorting, and filtering.
 *
 * Supports filtering cities by state with configurable
 * pagination and sorting options.
 *
 * @example
 * ```typescript
 * // Get cities in São Paulo, sorted by name
 * const query: FindAllCitiesDto = {
 *   page: 1,
 *   limit: 50,
 *   sortBy: CitySortField.Name,
 *   sortOrder: SortOrder.Ascending,
 *   state: BrazilianState.SP
 * };
 * ```
 */
export class FindAllCitiesDto {
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
		default: CitySortField.Name,
		enum: CitySortField,
		examples: [CitySortField.Name, CitySortField.State],
		enumName: "CitySortField",
	})
	@IsOptional()
	@IsEnum(CitySortField, { message: "Invalid sort field" })
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

	/** Filter by Brazilian state */
	@ApiPropertyOptional({
		description: "Filter cities by state",
		enum: BrazilianState,
		example: BrazilianState.SP,
		enumName: "BrazilianState",
	})
	@IsOptional()
	@IsEnum(BrazilianState, { message: "Invalid state" })
	state?: string;
}
