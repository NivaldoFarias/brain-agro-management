import styled from "styled-components";

import type { InputHTMLAttributes } from "react";

/** Props for the Input component */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	/** Whether the input has a validation error */
	hasError?: boolean;

	/** Full width input */
	fullWidth?: boolean;
}

/**
 * Accessible form input component with error states.
 *
 * Supports all native HTML input attributes and integrates with form validation.
 * Uses theme tokens for consistent styling across the application.
 *
 * @example
 * ```tsx
 * <Input
 *   type="text"
 *   placeholder="Enter producer name"
 *   hasError={!!errors.name}
 * />
 * ```
 */
export function Input({ hasError = false, fullWidth = false, ...props }: InputProps) {
	return <StyledInput $hasError={hasError} $fullWidth={fullWidth} {...props} />;
}

const StyledInput = styled.input<{ $hasError: boolean; $fullWidth: boolean }>`
	width: ${(props) => (props.$fullWidth ? "100%" : "auto")};
	padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
	font-size: ${(props) => props.theme.typography.fontSize.base};
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	line-height: ${(props) => props.theme.typography.lineHeight.normal};
	color: ${(props) => props.theme.colors.text};
	background-color: ${(props) => props.theme.colors.background};
	border: 1px solid ${(props) => (props.$hasError ? props.theme.colors.error : props.theme.colors.border)};
	border-radius: ${(props) => props.theme.borderRadius.md};
	transition: all ${(props) => props.theme.transitions.fast};

	&:hover:not(:disabled) {
		border-color: ${(props) => (props.$hasError ? props.theme.colors.error : props.theme.colors.grey[400])};
	}

	&:focus {
		outline: none;
		border-color: ${(props) => (props.$hasError ? props.theme.colors.error : props.theme.colors.primary)};
		box-shadow: 0 0 0 3px
			${(props) => (props.$hasError ? props.theme.colors.error + "20" : props.theme.colors.primary + "20")};
	}

	&:disabled {
		background-color: ${(props) => props.theme.colors.backgroundAlt};
		color: ${(props) => props.theme.colors.textDisabled};
		cursor: not-allowed;
		opacity: 0.6;
	}

	&::placeholder {
		color: ${(props) => props.theme.colors.textSecondary};
		opacity: 0.6;
	}
`;
