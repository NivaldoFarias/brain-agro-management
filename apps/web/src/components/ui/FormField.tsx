import styled from "styled-components";

import type { ReactElement, ReactNode } from "react";

/** Props for the FormField component */
export interface FormFieldProps {
	/** Unique identifier for the input element */
	id: string;

	/** Field label text */
	label: string;

	/** Whether the field is required */
	required?: boolean;

	/** Error message to display */
	error?: string;

	/** Input component or any form control */
	children: ReactNode;

	/** Additional hint text */
	hint?: string;
}

/**
 * Form field wrapper that combines label, input, error, and hint.
 *
 * Provides consistent spacing and layout for form fields.
 * Automatically connects label to input via id attribute.
 *
 * @example
 * ```tsx
 * <FormField
 *   id="producer-name"
 *   label="Producer Name"
 *   required
 *   error={errors.name?.message}
 * >
 *   <Input {...register("name")} />
 * </FormField>
 * ```
 */
export function FormField({ id, label, required = false, error, children, hint }: FormFieldProps): ReactElement {
	return (
		<FieldContainer>
			<StyledLabel htmlFor={id}>
				{label}
				{required && <RequiredIndicator aria-label="required">*</RequiredIndicator>}
			</StyledLabel>
			{hint && !error && <HintText>{hint}</HintText>}
			{children}
			{error && (
				<ErrorText role="alert" aria-live="polite">
					{error}
				</ErrorText>
			)}
		</FieldContainer>
	);
}

const FieldContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: ${(props) => props.theme.spacing.md};
`;

const StyledLabel = styled.label`
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

const HintText = styled.span`
	margin-bottom: ${(props) => props.theme.spacing.xs};
	font-size: ${(props) => props.theme.typography.fontSize.xs};
	color: ${(props) => props.theme.colors.textSecondary};
	line-height: ${(props) => props.theme.typography.lineHeight.tight};
`;

const ErrorText = styled.span`
	margin-top: ${(props) => props.theme.spacing.xs};
	font-size: ${(props) => props.theme.typography.fontSize.xs};
	color: ${(props) => props.theme.colors.error};
	line-height: ${(props) => props.theme.typography.lineHeight.tight};
`;
