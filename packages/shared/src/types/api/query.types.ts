import type { SortOrder } from "../../enums";

/** Base pagination parameters */
export interface PaginationParams {
	/** Page number */
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
	/** Current page number */
	page: number;

	/** Number of items per page */
	limit: number;

	/** Total number of items across all pages */
	total: number;

	/** Total number of pages */
	totalPages: number;
}

/** Paginated API response */
export interface PaginatedResponse<T> extends PaginationMeta {
	/** Array of data items for current page */
	data: Array<T>;
}

export interface BaseListFilterOptions<T extends string>
	extends PaginationParams,
		SortParams<T>,
		SearchParams {}
