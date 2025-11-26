import * as SelectPrimitive from "@radix-ui/react-select";
import styled from "styled-components";

import type { ReactNode } from "react";

/** Select option type */
export interface SelectOption {
	/** Option value */
	value: string;

	/** Option label */
	label: string;

	/** Whether option is disabled */
	disabled?: boolean;
}

/** Props for the Select component */
export interface SelectProps {
	/** Current selected value */
	"value"?: string;

	/** Callback when value changes */
	"onValueChange": (value: string) => void;

	/** Placeholder text */
	"placeholder"?: string;

	/** Select options */
	"options": SelectOption[];

	/** Whether select is disabled */
	"disabled"?: boolean;

	/** Accessible label */
	"aria-label"?: string;
}

/**
 * Accessible select dropdown component built on Radix UI primitives.
 *
 * Provides keyboard navigation, typeahead search, and ARIA attributes.
 * Supports controlled mode with external state management.
 *
 * @example
 * ```tsx
 * const [state, setState] = useState("");
 *
 * <Select
 *   value={state}
 *   onValueChange={setState}
 *   placeholder="Select state"
 *   aria-label="Producer state"
 *   options={[
 *     { value: "SP", label: "São Paulo" },
 *     { value: "RJ", label: "Rio de Janeiro" },
 *   ]}
 * />
 * ```
 */
export function Select({
	value,
	onValueChange,
	placeholder = "Select an option",
	options,
	disabled = false,
	...props
}: SelectProps) {
	return (
		<SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
			<StyledTrigger aria-label={props["aria-label"]}>
				<SelectPrimitive.Value placeholder={placeholder} />
				<StyledIcon>▼</StyledIcon>
			</StyledTrigger>
			<SelectPrimitive.Portal>
				<StyledContent>
					<StyledViewport>
						{options.map((option) => (
							<StyledItem key={option.value} value={option.value} disabled={option.disabled}>
								<SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
							</StyledItem>
						))}
					</StyledViewport>
				</StyledContent>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
}

/**
 * Select group component for organizing options.
 *
 * @example
 * ```tsx
 * <SelectGroup label="Brazilian States">
 *   <SelectItem value="SP">São Paulo</SelectItem>
 * </SelectGroup>
 * ```
 */
export function SelectGroup({ label, children }: { label: string; children: ReactNode }) {
	return (
		<SelectPrimitive.Group>
			<StyledLabel>{label}</StyledLabel>
			{children}
		</SelectPrimitive.Group>
	);
}

const StyledTrigger = styled(SelectPrimitive.Trigger)`
	display: inline-flex;
	align-items: center;
	justify-content: space-between;
	gap: ${(props) => props.theme.spacing.sm};
	padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.text};
	background-color: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => props.theme.colors.border};
	border-radius: ${(props) => props.theme.borderRadius.md};
	min-width: 200px;
	min-height: 40px;
	cursor: pointer;
	transition: all ${(props) => props.theme.transitions.fast};

	&:hover:not(:disabled) {
		border-color: ${(props) => props.theme.colors.primary};
	}

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme.colors.primary};
		box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}20;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	&[data-placeholder] {
		color: ${(props) => props.theme.colors.textSecondary};
	}
`;

const StyledIcon = styled(SelectPrimitive.Icon)`
	font-size: ${(props) => props.theme.typography.fontSize.xs};
	color: ${(props) => props.theme.colors.textSecondary};
	transition: transform ${(props) => props.theme.transitions.fast};

	[data-state="open"] & {
		transform: rotate(180deg);
	}
`;

const StyledContent = styled(SelectPrimitive.Content)`
	overflow: hidden;
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: ${(props) => props.theme.borderRadius.md};
	box-shadow: ${(props) => props.theme.shadows.lg};
	border: 1px solid ${(props) => props.theme.colors.border};
	z-index: ${(props) => props.theme.zIndex.dropdown};
	animation: slideDown 150ms ease-out;

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
`;

const StyledViewport = styled(SelectPrimitive.Viewport)`
	padding: ${(props) => props.theme.spacing.sm};
`;

const StyledItem = styled(SelectPrimitive.Item)`
	display: flex;
	align-items: center;
	padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.text};
	border-radius: ${(props) => props.theme.borderRadius.sm};
	cursor: pointer;
	user-select: none;
	outline: none;

	&:hover {
		background-color: ${(props) => props.theme.colors.backgroundAlt};
	}

	&:focus {
		background-color: ${(props) => props.theme.colors.backgroundAlt};
	}

	&[data-state="checked"] {
		background-color: ${(props) => props.theme.colors.primary}10;
		color: ${(props) => props.theme.colors.primary};
		font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	}

	&[data-disabled] {
		opacity: 0.5;
		pointer-events: none;
	}
`;

const StyledLabel = styled(SelectPrimitive.Label)`
	padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.textSecondary};
`;
