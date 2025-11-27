import { useState } from "react";
import styled from "styled-components";

import type { ChangeEvent, FormEvent, ReactElement } from "react";

import { SearchIcon } from "./Icon";

/** Props for the SearchBar component */
export interface SearchBarProps {
	/** Current search query value */
	value?: string;

	/** Callback when search query changes */
	onChange?: (value: string) => void;

	/** Callback when search is submitted */
	onSubmit?: (value: string) => void;

	/** Placeholder text */
	placeholder?: string;

	/** Whether the search bar is disabled */
	disabled?: boolean;

	/** Debounce delay in milliseconds */
	debounceMs?: number;
}

/**
 * Search input component with icon and optional debouncing.
 *
 * Provides a styled search input with search icon and submit handling.
 * Can be used as controlled or uncontrolled component.
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState("");
 *
 * <SearchBar
 *   value={query}
 *   onChange={setQuery}
 *   onSubmit={(value) => console.log("Search:", value)}
 *   placeholder="Search producers..."
 *   debounceMs={300}
 * />
 * ```
 */
export function SearchBar({
	value: controlledValue,
	onChange,
	onSubmit,
	placeholder = "Search...",
	disabled = false,
	debounceMs = 0,
}: SearchBarProps): ReactElement {
	const [internalValue, setInternalValue] = useState(controlledValue ?? "");
	const isControlled = controlledValue !== undefined;
	const value = isControlled ? controlledValue : internalValue;

	const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const newValue = e.target.value;

		if (!isControlled) {
			setInternalValue(newValue);
		}

		if (onChange) {
			if (debounceMs > 0) {
				// TODO: Implement debounce logic when needed
				onChange(newValue);
			} else {
				onChange(newValue);
			}
		}
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (onSubmit) {
			onSubmit(value);
		}
	};

	return (
		<SearchForm onSubmit={handleSubmit}>
			<SearchIconWrapper>
				<SearchIcon size={18} />
			</SearchIconWrapper>
			<SearchInput
				type="text"
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				disabled={disabled}
				aria-label="Search"
			/>
		</SearchForm>
	);
}

const SearchForm = styled.form`
	position: relative;
	display: flex;
	align-items: center;
	width: 100%;
	max-width: 400px;
`;

const SearchIconWrapper = styled.div`
	position: absolute;
	left: ${(props) => props.theme.spacing.md};
	display: flex;
	align-items: center;
	pointer-events: none;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const SearchInput = styled.input`
	width: 100%;
	padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
	padding-left: calc(${(props) => props.theme.spacing.md} + 18px + ${(props) => props.theme.spacing.sm});
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.text};
	background-color: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => props.theme.colors.border};
	border-radius: ${(props) => props.theme.borderRadius.md};
	transition: all ${(props) => props.theme.transitions.fast};

	&::placeholder {
		color: ${(props) => props.theme.colors.textSecondary};
	}

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme.colors.primary};
		box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}20;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: ${(props) => props.theme.colors.backgroundAlt};
	}
`;
