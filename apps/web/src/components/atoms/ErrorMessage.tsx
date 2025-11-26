import styled from "styled-components";

import type { ReactNode } from "react";

/** Props for the ErrorMessage component */
export interface ErrorMessageProps {
	/** Error message text */
	children: ReactNode;

	/** ID for aria-describedby association */
	id?: string;
}

/**
 * Error message component for form validation feedback.
 *
 * Displays validation errors with consistent styling and accessibility.
 * Use with `aria-describedby` on input elements for screen reader support.
 *
 * @example
 * ```tsx
 * <Input
 *   id="producer-name"
 *   hasError={!!errors.name}
 *   aria-describedby="name-error"
 * />
 * {errors.name && (
 *   <ErrorMessage id="name-error">
 *     {errors.name.message}
 *   </ErrorMessage>
 * )}
 * ```
 */
export function ErrorMessage({ children, id }: ErrorMessageProps) {
	return (
		<StyledError id={id} role="alert" aria-live="polite">
			{children}
		</StyledError>
	);
}

const StyledError = styled.span`
	display: block;
	font-family: ${(props) => props.theme.typography.fontFamily.base};
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.error};
	margin-top: ${(props) => props.theme.spacing.xs};
	line-height: ${(props) => props.theme.typography.lineHeight.normal};
`;
