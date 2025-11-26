import styled from "styled-components";

import type { LabelHTMLAttributes, ReactNode } from "react";

/** Props for the Label component */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
	/** Label text */
	children: ReactNode;

	/** Whether label is for required field */
	required?: boolean;
}

/**
 * Accessible form label component with consistent styling.
 *
 * Provides semantic label element with required indicator support.
 * Always use with `htmlFor` prop to associate with input elements.
 *
 * @example
 * ```tsx
 * <Label htmlFor="producer-name" required>
 *   Producer Name
 * </Label>
 * <Input id="producer-name" />
 * ```
 */
export function Label({ children, required = false, ...props }: LabelProps) {
	return (
		<StyledLabel {...props}>
			{children}
			{required && <RequiredIndicator aria-label="required">*</RequiredIndicator>}
		</StyledLabel>
	);
}

const StyledLabel = styled.label`
	display: inline-block;
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	color: ${(props) => props.theme.colors.text};
	margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const RequiredIndicator = styled.span`
	color: ${(props) => props.theme.colors.error};
	margin-left: ${(props) => props.theme.spacing.xs};
`;
