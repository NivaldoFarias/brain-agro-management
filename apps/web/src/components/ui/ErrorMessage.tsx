import styled from "styled-components";

import type { HTMLAttributes, ReactElement } from "react";

/** Props for the ErrorMessage component */
export interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
	/** Error message text */
	message: string;

	/** Optional retry callback */
	onRetry?: () => void;
}

/**
 * Error message component with optional retry action.
 *
 * Displays user-friendly error messages with consistent styling.
 * Includes retry button when onRetry callback is provided.
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   message="Failed to load producers"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function ErrorMessage({ message, onRetry, ...props }: ErrorMessageProps): ReactElement {
	return (
		<Container role="alert" {...props}>
			<ErrorIcon aria-hidden="true">⚠</ErrorIcon>
			<Message>{message}</Message>
			{onRetry && (
				<RetryButton onClick={onRetry} type="button">
					Try Again
				</RetryButton>
			)}
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: ${(props) => props.theme.spacing.xl};
	text-align: center;
	gap: ${(props) => props.theme.spacing.md};
`;

const ErrorIcon = styled.span`
	font-size: 48px;
	color: ${(props) => props.theme.colors.error};
`;

const Message = styled.p`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.text};
	line-height: ${(props) => props.theme.typography.lineHeight.normal};
`;

const RetryButton = styled.button`
	padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.lg};
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	color: ${(props) => props.theme.colors.primary};
	background-color: transparent;
	border: 1px solid ${(props) => props.theme.colors.primary};
	border-radius: ${(props) => props.theme.borderRadius.md};
	cursor: pointer;
	transition: all ${(props) => props.theme.transitions.fast};

	&:hover {
		background-color: ${(props) => props.theme.colors.primaryLight};
		color: ${(props) => props.theme.colors.background};
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}20;
	}
`;
