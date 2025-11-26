import styled from "styled-components";

import type { InputProps } from "../atoms";
import type { ReactElement } from "react";

import { ErrorMessage, Input, Label } from "../atoms";

/** Props for the FormField component */
export interface FormFieldProps extends Omit<InputProps, "id"> {
	/** Unique field identifier for htmlFor and aria-describedby */
	id: string;

	/** Field label text */
	label: string;

	/** Whether field is required */
	required?: boolean;

	/** Error message to display */
	error?: string;

	/** Helper text to display below input */
	helperText?: string;
}

/**
 * Composite form field component with label, input, and error message.
 *
 * Combines Label, Input, and ErrorMessage atoms into a reusable molecule
 * with proper accessibility attributes and consistent spacing.
 *
 * @example
 * ```tsx
 * <FormField
 *   id="producer-name"
 *   label="Producer Name"
 *   required
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   error={errors.name?.message}
 *   helperText="Enter the full name as registered"
 * />
 * ```
 */
export function FormField({
	id,
	label,
	required = false,
	error,
	helperText,
	...inputProps
}: FormFieldProps): ReactElement {
	const errorId = error ? `${id}-error` : undefined;
	const helperId = helperText ? `${id}-helper` : undefined;
	const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

	return (
		<FieldContainer>
			<Label htmlFor={id} required={required}>
				{label}
			</Label>
			<Input id={id} hasError={!!error} aria-invalid={!!error} aria-describedby={describedBy} {...inputProps} />
			{helperText && !error && <HelperText id={helperId}>{helperText}</HelperText>}
			{error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
		</FieldContainer>
	);
}

const FieldContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: ${(props) => props.theme.spacing.xs};
`;

const HelperText = styled.span`
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};
	line-height: ${(props) => props.theme.typography.lineHeight.normal};
`;
