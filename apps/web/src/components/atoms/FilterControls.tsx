import { Badge, Box, Button, Flex, Select, Text, TextField } from "@radix-ui/themes";
import { FilterIcon, FilterXIcon, SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { FarmFilterOptions, ProducersFilterOptions } from "@agro/shared/types";

import { BrazilianState, CropType, FarmSortField, ProducerSortField, SortOrder } from "@agro/shared/enums";

import { Autocomplete } from "@/components/molecules";
import { useLocalStorageContext } from "@/contexts";
import { STORAGE_KEYS } from "@/utils";

/**
 * Base props for filter controls component
 *
 * @template T Type of filter options
 * @template U Type of entity being filtered
 */
interface BaseFilterControlProps<T, U> {
	type: U;

	/** Current filter values */
	filters: T;

	/** Callback when filters change */
	onFiltersChange: (filters: T) => void;

	/** Whether the parent is loading data */
	isLoading?: boolean;
}

/** Props for producer filtering */
type ProducerFilterControlsProps = BaseFilterControlProps<ProducersFilterOptions, "producers">;

/** Props for farm filtering */
type FarmFilterControlsProps = BaseFilterControlProps<FarmFilterOptions, "farms"> & {
	/** Available producers for farm filtering */
	availableProducers?: { id: string; name: string }[];
};

/** Union type for discriminated props */
type FilterControlsProps = ProducerFilterControlsProps | FarmFilterControlsProps;

/**
 * Reusable filter controls component for producers and farms lists.
 *
 * Provides search input, sort field selector, sort order toggle, and
 * entity-specific filters (state, city, producer for farms).
 * Built with Radix UI primitives for accessibility and consistency.
 *
 * @example
 * ```tsx
 * <FilterControls
 *   type="farms"
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   isLoading={isLoading}
 *   availableProducers={producers}
 * />
 * ```
 */
export function FilterControls(props: FilterControlsProps) {
	const { filters, onFiltersChange, type, isLoading = false } = props;
	const { t } = useTranslation();
	const [localSearch, setLocalSearch] = useState(filters.search ?? "");

	useEffect(() => {
		const timer = setTimeout(() => {
			if (localSearch !== filters.search) {
				if (type === "producers") {
					onFiltersChange({ ...filters, search: localSearch });
				} else {
					onFiltersChange({ ...filters, search: localSearch });
				}
			}
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [localSearch, filters, onFiltersChange, type]);

	const sortFieldOptions = {
		producers: [
			{ value: ProducerSortField.Name, label: t(($) => $.producers.name) },
			{ value: ProducerSortField.Document, label: t(($) => $.producers.document) },
			{ value: ProducerSortField.CreatedAt, label: t(($) => $.form.createdAt) },
		],
		farms: [
			{ value: FarmSortField.Name, label: t(($) => $.farms.name) },
			{ value: FarmSortField.TotalArea, label: t(($) => $.farms.totalArea) },
			{ value: FarmSortField.ArableArea, label: t(($) => $.farms.arableArea) },
			{ value: FarmSortField.VegetationArea, label: t(($) => $.farms.vegetationArea) },
			{ value: FarmSortField.City, label: t(($) => $.farms.city) },
			{ value: FarmSortField.State, label: t(($) => $.farms.state) },
			{ value: FarmSortField.CreatedAt, label: t(($) => $.form.createdAt) },
		],
	};

	const sortOrderOptions = [
		{ value: SortOrder.Ascending, label: t(($) => $.filters.ascending) },
		{ value: SortOrder.Descending, label: t(($) => $.filters.descending) },
	];

	const hasActiveFilters = useMemo(() => {
		const defaultSortBy = type === "producers" ? ProducerSortField.Name : FarmSortField.Name;
		const defaultSortOrder = SortOrder.Ascending;

		const isDefaultSort = filters.sortBy === defaultSortBy && filters.sortOrder === defaultSortOrder;

		const hasSearch = Boolean(filters.search && filters.search.trim() !== "");

		if (type === "producers") {
			return !isDefaultSort || hasSearch;
		} else {
			const hasFarmSpecificFilters =
				Boolean(filters.state) ||
				Boolean(filters.city) ||
				Boolean(filters.producerId) ||
				Boolean(filters.crops && filters.crops.length > 0);

			return !isDefaultSort || hasSearch || hasFarmSpecificFilters;
		}
	}, [filters, type]);

	const handleClearFilters = () => {
		setLocalSearch("");

		if (type === "producers") {
			onFiltersChange({
				sortBy: ProducerSortField.Name,
				sortOrder: SortOrder.Ascending,
			});
		} else {
			onFiltersChange({
				sortBy: FarmSortField.Name,
				sortOrder: SortOrder.Ascending,
			});
		}
	};

	return (
		<Box>
			<Flex direction="column" gap="2">
				{/* Search and Sort Row */}
				<Flex gap="3" wrap="wrap" align="end">
					{/* Search Input */}
					<Box style={{ flex: "1 1 250px", minWidth: "200px" }}>
						<Text as="label" size="2" weight="medium" mb="1">
							{t(($) => $.common.search)}
						</Text>
						<TextField.Root
							placeholder={t(($) => $.farms.searchPlaceholder)}
							value={localSearch}
							onChange={(event) => {
								setLocalSearch(event.target.value);
							}}
							disabled={isLoading}
						>
							<TextField.Slot>
								<SearchIcon size={16} />
							</TextField.Slot>
						</TextField.Root>
					</Box>

					{/* Sort By Select */}
					<Box style={{ flex: "0 1 200px", minWidth: "150px" }}>
						<Text as="label" size="2" weight="medium" mb="1">
							{t(($) => $.filters.sortBy)}
						</Text>
						<Select.Root
							value={filters.sortBy ?? (type === "producers" ? ProducerSortField.Name : FarmSortField.Name)}
							onValueChange={(value) => {
								if (type === "producers") {
									onFiltersChange({ ...filters, sortBy: value as ProducerSortField });
								} else {
									onFiltersChange({ ...filters, sortBy: value as FarmSortField });
								}
							}}
							disabled={isLoading}
						>
							<Select.Trigger style={{ width: "100%" }} />
							<Select.Content>
								{sortFieldOptions[type].map((option) => (
									<Select.Item key={option.value} value={option.value}>
										{option.label}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Root>
					</Box>

					{/* Sort Order Select */}
					<Box style={{ flex: "0 1 150px", minWidth: "120px" }}>
						<Text as="label" size="2" weight="medium" mb="1">
							{t(($) => $.filters.order)}
						</Text>
						<Select.Root
							value={filters.sortOrder ?? SortOrder.Ascending}
							onValueChange={(value) => {
								if (type === "producers") {
									onFiltersChange({ ...filters, sortOrder: value as SortOrder });
								} else {
									onFiltersChange({ ...filters, sortOrder: value as SortOrder });
								}
							}}
							disabled={isLoading}
						>
							<Select.Trigger style={{ width: "100%" }} />
							<Select.Content>
								{sortOrderOptions.map((option) => (
									<Select.Item key={option.value} value={option.value}>
										{option.label}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Root>
					</Box>

					{/* Clear Filters Button */}
					<Button variant="soft" color="gray" onClick={handleClearFilters} disabled={!hasActiveFilters || isLoading}>
						<FilterXIcon size={16} />
						{t(($) => $.filters.clear)}
					</Button>
				</Flex>

				{type === "farms" ?
					<FarmFilters
						filters={filters}
						isLoading={isLoading}
						onFiltersChange={onFiltersChange}
						availableProducers={props.availableProducers}
					/>
				:	null}

				{/* Active Filters Indicator */}
				{hasActiveFilters && (
					<Flex align="center" gap="2">
						<FilterIcon size={14} />
						<Text size="1" color="gray">
							{t(($) => $.filters.activeFilters)}
						</Text>
					</Flex>
				)}
			</Flex>
		</Box>
	);
}

/** Component for farm-specific filters */
function FarmFilters({
	filters,
	isLoading,
	onFiltersChange,
	availableProducers,
}: Omit<FarmFilterControlsProps, "type">) {
	const { t } = useTranslation();
	const storage = useLocalStorageContext();

	/** Get cities from localStorage */
	const availableCities = useMemo<Record<BrazilianState, string[]>>(() => {
		const cities = storage.getItem<Record<BrazilianState, string[]>>(STORAGE_KEYS.citiesByState);

		return cities ?? ({} as unknown as Record<BrazilianState, string[]>);
	}, [storage]);

	/** Get available cities as flat array, optionally filtered by state */
	const cityOptions = useMemo(() => {
		if (filters.state) return availableCities[filters.state];

		return Object.values(availableCities).flat();
	}, [filters.state, availableCities]);

	return (
		<Flex gap="3" wrap="wrap" mb="2">
			{/* State Filter */}
			<Box style={{ flex: "1 1 180px", minWidth: "110px" }}>
				<Text as="label" size="2" weight="medium">
					{t(($) => $.farms.state)}
				</Text>
				<Select.Root
					value={filters.state ?? ""}
					onValueChange={(value) => {
						onFiltersChange({ ...filters, state: value === "" ? undefined : (value as BrazilianState) });
					}}
					disabled={isLoading}
				>
					<Select.Trigger placeholder={t(($) => $.farms.selectState)} style={{ width: "100%" }} />
					<Select.Content>
						{Object.values(BrazilianState).map((state) => (
							<Select.Item key={state} value={state}>
								{t(($) => $.states[state])}
							</Select.Item>
						))}
					</Select.Content>
				</Select.Root>
			</Box>

			{/* City Filter - Autocomplete */}
			{Object.keys(availableCities).length > 0 && (
				<Box style={{ flex: "1 1 180px", minWidth: "150px" }}>
					<Autocomplete
						label={t(($) => $.farms.city)}
						value={filters.city}
						placeholder={t(($) => $.farms.selectCity)}
						options={cityOptions}
						getOptionLabel={(city) => city}
						getOptionValue={(city) => city}
						onSelect={(city) => {
							onFiltersChange({ ...filters, city });
						}}
						disabled={isLoading}
						maxResults={50}
					/>
				</Box>
			)}

			{/* Producer Filter - Autocomplete */}
			{availableProducers && availableProducers.length > 0 && (
				<Box style={{ flex: "1 1 200px", minWidth: "180px" }}>
					<Autocomplete
						label={t(($) => $.farms.producer)}
						value={filters.producerId}
						placeholder={t(($) => $.farms.selectProducer)}
						options={availableProducers}
						getOptionLabel={(producer) => producer.name}
						getOptionValue={(producer) => producer.id}
						onSelect={(producerId) => {
							onFiltersChange({ ...filters, producerId });
						}}
						disabled={isLoading}
						maxResults={50}
					/>
				</Box>
			)}

			{/* Crops Filter */}
			<Box>
				<Text as="label" size="2" weight="medium" mb="1">
					{t(($) => $.dashboard.crops)}
				</Text>
				<Flex gap="2" wrap="wrap" mt="2">
					{Object.values(CropType).map((crop) => {
						const isSelected = filters.crops?.includes(crop) ?? false;
						const cropToColor: Record<CropType, "blue" | "green" | "orange" | "gray" | "red"> = {
							[CropType.Corn]: "green",
							[CropType.Soy]: "blue",
							[CropType.Coffee]: "orange",
							[CropType.Sugarcane]: "gray",
							[CropType.Cotton]: "red",
						};

						return (
							<Badge
								key={crop}
								color={cropToColor[crop]}
								variant={isSelected ? "solid" : "soft"}
								size="2"
								style={{ cursor: "pointer" }}
								onClick={() => {
									const currentCrops = filters.crops ?? [];
									const newCrops =
										isSelected ? currentCrops.filter((currentCrop) => currentCrop !== crop) : [...currentCrops, crop];

									onFiltersChange({ ...filters, crops: newCrops.length > 0 ? newCrops : undefined });
								}}
							>
								{t(($) => $.crops[crop])}
							</Badge>
						);
					})}
				</Flex>
			</Box>
		</Flex>
	);
}
