import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

import { ProducerSortField, SortOrder } from "@agro/shared/enums";

/**
 * Query parameters for finding all producers with pagination, sorting, and search.
 *
 * Supports filtering producers by name search with configurable
 * pagination and sorting options.
 *
 * @example
 * ```typescript
 * // Get second page, sorted by name descending, searching for "Silva"
 * const query: FindAllProducersDto = {
 *   page: 2,
 *   limit: 20,
 *   sortBy: ProducerSortField.Name,
 *   sortOrder: SortOrder.Descending,
 *   search: "Silva"
 * };
 * ```
 */
export class FindAllProducersDto {
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
		default: ProducerSortField.Name,
		enum: ProducerSortField,
		examples: [ProducerSortField.Name, ProducerSortField.Document, ProducerSortField.CreatedAt],
		enumName: "ProducerSortField",
	})
	@IsOptional()
	@IsEnum(ProducerSortField, { message: "Invalid sort field" })
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

	/** Search query for producer name */
	@ApiPropertyOptional({
		description: "Search query for producer name (case-insensitive)",
		example: "Silva",
	})
	@IsOptional()
	@IsString({ message: "Search must be a string" })
	search?: string;
}
