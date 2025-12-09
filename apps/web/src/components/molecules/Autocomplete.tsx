import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

/** Props for the Autocomplete component */
export interface AutocompleteProps<T> {
	/** Current selected value */
	value?: string;

	/** Placeholder text for the input field */
	placeholder?: string;

	/** Whether the input is disabled */
	disabled?: boolean;

	/** Available options to search through */
	options: T[];

	/** Function to get the display label from an option */
	getOptionLabel: (option: T) => string;

	/** Function to get the value from an option */
	getOptionValue: (option: T) => string;

	/** Callback when an option is selected */
	onSelect: (value: string | undefined) => void;

	/** Filter function to determine which options match the search */
	filterOptions?: (options: T[], searchTerm: string) => T[];

	/** Maximum number of results to display (default: 50) */
	maxResults?: number;

	/** Label for the input field */
	label?: string;

	/** Size of the text field */
	size?: "1" | "2" | "3";
}

/**
 * Reusable autocomplete component with search functionality.
 *
 * Provides a text input with dropdown showing filtered results as the user types.
 * Supports custom filtering logic and displays selected value as a chip.
 *
 * @example
 * ```tsx
 * <Autocomplete
 *   value={selectedCity}
 *   placeholder="Search cities..."
 *   options={cities}
 *   getOptionLabel={(city) => city}
 *   getOptionValue={(city) => city}
 *   onSelect={setSelectedCity}
 * />
 * ```
 */
export function Autocomplete<T>({
	value,
	placeholder,
	disabled = false,
	options,
	getOptionLabel,
	getOptionValue,
	onSelect,
	filterOptions,
	maxResults = 50,
	label,
	size = "2",
}: AutocompleteProps<T>) {
	const [searchTerm, setSearchTerm] = useState("");

	/** Default filter function - case-insensitive substring match */
	const defaultFilterOptions = (opts: T[], search: string): T[] => {
		if (!search.trim()) return [];

		return opts
			.filter((option) => getOptionLabel(option).toLowerCase().includes(search.toLowerCase()))
			.slice(0, maxResults);
	};

	const filteredOptions = (filterOptions ?? defaultFilterOptions)(options, searchTerm);

	/** Get the display label for the current value */
	const selectedLabel = value ? options.find((opt) => getOptionValue(opt) === value) : undefined;

	return (
		<Box style={{ position: "relative" }}>
			{label && (
				<Text as="label" size="2" weight="medium" mb="1">
					{label}
				</Text>
			)}

			<TextField.Root
				placeholder={placeholder}
				value={value ? "" : searchTerm}
				onChange={(event) => {
					const newValue = event.target.value;
					setSearchTerm(newValue);

					// Clear filter if user clears input
					if (!newValue && value) {
						onSelect(undefined);
					}
				}}
				onBlur={() => {
					// Clear search term when losing focus if there's a selected value
					if (value && searchTerm !== (selectedLabel ? getOptionLabel(selectedLabel) : "")) {
						setSearchTerm("");
					}
				}}
				disabled={disabled}
				size={size}
			>
				<TextField.Slot>
					<SearchIcon
						size={
							size === "1" ? 12
							: size === "3" ?
								18
							:	14
						}
					/>
				</TextField.Slot>
			</TextField.Root>

			{/* Dropdown with filtered results */}
			{searchTerm && filteredOptions.length > 0 && (
				<Box
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						right: 0,
						maxHeight: "200px",
						overflowY: "auto",
						backgroundColor: "var(--color-background)",
						border: "1px solid var(--gray-6)",
						borderRadius: "var(--radius-2)",
						marginTop: "4px",
						zIndex: 1000,
						boxShadow: "var(--shadow-4)",
					}}
				>
					{filteredOptions.map((option, index) => {
						const optionValue = getOptionValue(option);
						const optionLabel = getOptionLabel(option);

						return (
							<Box
								key={optionValue}
								onClick={() => {
									onSelect(optionValue);
									setSearchTerm("");
								}}
								style={{
									padding: "8px 12px",
									cursor: "pointer",
									borderBottom: index < filteredOptions.length - 1 ? "1px solid var(--gray-4)" : "none",
								}}
								onMouseEnter={(event) => {
									event.currentTarget.style.backgroundColor = "var(--gray-3)";
								}}
								onMouseLeave={(event) => {
									event.currentTarget.style.backgroundColor = "transparent";
								}}
							>
								<Text size="2">{optionLabel}</Text>
							</Box>
						);
					})}
				</Box>
			)}

			{/* Show selected value with clear button */}
			{value && selectedLabel && !searchTerm && (
				<Flex
					align="center"
					gap="1"
					mt="1"
					style={{
						padding: "4px 8px",
						backgroundColor: "var(--accent-3)",
						borderRadius: "var(--radius-2)",
						width: "fit-content",
					}}
				>
					<Text size="1" weight="medium">
						{getOptionLabel(selectedLabel)}
					</Text>
					<Button
						size="1"
						variant="ghost"
						color="gray"
						onClick={() => {
							onSelect(undefined);
							setSearchTerm("");
						}}
						disabled={disabled}
						style={{ minWidth: "auto", padding: "2px" }}
					>
						×
					</Button>
				</Flex>
			)}
		</Box>
	);
}
