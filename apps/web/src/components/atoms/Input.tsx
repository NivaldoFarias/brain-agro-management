import styled from "styled-components";

import type { InputHTMLAttributes } from "react";

/** Props for the Input component */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	/** Whether input has error state */
	hasError?: boolean;

	/** Input width variant */
	width?: "full" | "auto";
}

/**
 * Accessible text input component with consistent styling.
 *
 * Provides standard form input with error states, disabled states,
 * and keyboard navigation support.
 *
 * @example
 * ```tsx
 * <Input
 *   type="text"
 *   placeholder="Producer name"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   hasError={!!errors.name}
 *   aria-describedby="name-error"
 * />
 * ```
 */
export function Input({ hasError = false, width = "full", ...props }: InputProps) {
	return <StyledInput hasError={hasError} width={width} {...props} />;
}

const StyledInput = styled.input<{ hasError: boolean; width: "full" | "auto" }>`
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.base};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	color: ${(props) => props.theme.colors.text};
	background-color: ${(props) => props.theme.colors.surface};
	border: 1.5px solid ${(props) => (props.hasError ? props.theme.colors.error : props.theme.colors.border)};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
	min-height: 44px;
	width: ${(props) => (props.width === "full" ? "100%" : "auto")};
	transition: all ${(props) => props.theme.transitions.base};

	&::placeholder {
		color: ${(props) => props.theme.colors.textSecondary};
		font-weight: ${(props) => props.theme.typography.fontWeight.normal};
	}

	&:hover:not(:disabled) {
		border-color: ${(props) => (props.hasError ? props.theme.colors.error : props.theme.colors.primary)};
		background-color: ${(props) => props.theme.colors.surfaceHover};
	}

	&:focus {
		outline: none;
		border-color: ${(props) => (props.hasError ? props.theme.colors.error : props.theme.colors.primary)};
		box-shadow: 0 0 0 4px ${(props) => (props.hasError ? props.theme.colors.error : props.theme.colors.primary)}15;
		background-color: ${(props) => props.theme.colors.surface};
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: ${(props) => props.theme.colors.backgroundAlt};
	}

	&[type="number"] {
		-moz-appearance: textfield;
	}

	&[type="number"]::-webkit-outer-spin-button,
	&[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
`;
