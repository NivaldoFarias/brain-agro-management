/**
 * Query parameter types for API pagination, sorting, filtering, and search.
 *
 * @module types/api/query
 */

/** Sort order direction */
export enum SortOrder {
	/** Ascending order (A-Z, 0-9, oldest-newest) */
	Ascending = "ASC",

	/** Descending order (Z-A, 9-0, newest-oldest) */
	Descending = "DESC",
}

/** Sortable fields for producers */
export enum ProducerSortField {
	/** Sort by producer name */
	Name = "name",

	/** Sort by document (CPF/CNPJ) */
	Document = "document",

	/** Sort by creation date */
	CreatedAt = "createdAt",
}

/** Sortable fields for farms */
export enum FarmSortField {
	/** Sort by farm name */
	Name = "name",

	/** Sort by total area */
	TotalArea = "totalArea",

	/** Sort by arable area */
	ArableArea = "arableArea",

	/** Sort by vegetation area */
	VegetationArea = "vegetationArea",

	/** Sort by city name */
	City = "city",

	/** Sort by state */
	State = "state",

	/** Sort by creation date */
	CreatedAt = "createdAt",
}

/** Sortable fields for cities */
export enum CitySortField {
	/** Sort by city name */
	Name = "name",

	/** Sort by state */
	State = "state",

	/** Sort by IBGE code */
	IbgeCode = "ibgeCode",
}

/** Base pagination parameters */
export interface PaginationParams {
	/** Page number (1-indexed) */
	page?: number;

	/** Number of items per page */
	limit?: number;
}

/** Base sorting parameters */
export interface SortParams<T extends string> {
	/** Field to sort by */
	sortBy?: T;

	/** Sort direction (ASC or DESC) */
	sortOrder?: SortOrder;
}

/** Base search parameters */
export interface SearchParams {
	/** Search query string */
	search?: string;
}

/** Paginated response metadata */
export interface PaginationMeta {
	/** Current page number (1-indexed) */
	page: number;

	/** Number of items per page */
	limit: number;

	/** Total number of items across all pages */
	total: number;

	/** Total number of pages */
	totalPages: number;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
	/** Array of data items for current page */
	data: Array<T>;

	/** Current page number (1-indexed) */
	page: number;

	/** Number of items per page */
	limit: number;

	/** Total number of items across all pages */
	total: number;

	/** Total number of pages */
	totalPages: number;
}
