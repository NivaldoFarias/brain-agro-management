import styled from "styled-components";

import type { LabelHTMLAttributes, ReactNode } from "react";

/** Props for the Label component */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
	/** Label content */
	children: ReactNode;

	/** Whether the field is required */
	required?: boolean;
}

/**
 * Accessible form label component with required indicator.
 *
 * Properly associates with form inputs via htmlFor attribute.
 * Displays required indicator when field is mandatory.
 *
 * @example
 * ```tsx
 * <Label htmlFor="name" required>
 *   Producer Name
 * </Label>
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
	margin-bottom: ${(props) => props.theme.spacing.xs};
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	color: ${(props) => props.theme.colors.text};
	line-height: ${(props) => props.theme.typography.lineHeight.tight};
`;

const RequiredIndicator = styled.span`
	margin-left: ${(props) => props.theme.spacing.xs};
	color: ${(props) => props.theme.colors.error};
`;
