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
