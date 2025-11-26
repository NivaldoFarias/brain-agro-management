import styled from "styled-components";

import type { HTMLAttributes, ReactElement } from "react";

import { Spinner } from "./Spinner";

/** Props for the LoadingState component */
export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
	/** Loading message text */
	message?: string;

	/** Spinner size */
	size?: "sm" | "md" | "lg";
}

/**
 * Loading state component for async data fetching.
 *
 * Displays spinner with optional message during loading operations.
 * Provides consistent loading experience across the application.
 *
 * @example
 * ```tsx
 * <LoadingState message="Loading producers..." size="md" />
 * ```
 */
export function LoadingState({ message = "Loading...", size = "md", ...props }: LoadingStateProps): ReactElement {
	return (
		<Container {...props}>
			<Spinner size={size} />
			<Message>{message}</Message>
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: ${(props) => props.theme.spacing.xl};
	gap: ${(props) => props.theme.spacing.md};
	min-height: 200px;
`;

const Message = styled.p`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.textSecondary};
	line-height: ${(props) => props.theme.typography.lineHeight.normal};
`;
