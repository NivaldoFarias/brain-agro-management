import styled from "styled-components";

import type { SpinnerSize } from "../atoms";
import type { ReactElement } from "react";

import { Spinner, Typography } from "../atoms";

/** Props for the LoadingState component */
export interface LoadingStateProps {
	/** Loading message */
	message?: string;

	/** Spinner size */
	size?: SpinnerSize;

	/** Whether to show full-page overlay */
	fullPage?: boolean;
}

/**
 * Loading state component with spinner and optional message.
 *
 * Provides visual feedback during data fetching or async operations.
 * Supports inline and full-page overlay modes.
 *
 * @example
 * ```tsx
 * {isLoading && (
 *   <LoadingState
 *     message="Loading producers..."
 *     size="lg"
 *     fullPage
 *   />
 * )}
 * ```
 */
export function LoadingState({
	message = "Loading...",
	size = "lg",
	fullPage = false,
}: LoadingStateProps): ReactElement {
	const content = (
		<ContentContainer>
			<Spinner size={size} aria-label={message} />
			<Typography variant="body" color="textSecondary">
				{message}
			</Typography>
		</ContentContainer>
	);

	if (fullPage) {
		return <FullPageContainer>{content}</FullPageContainer>;
	}

	return <InlineContainer>{content}</InlineContainer>;
}

const ContentContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: ${(props) => props.theme.spacing.md};
`;

const InlineContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: ${(props) => props.theme.spacing["2xl"]} ${(props) => props.theme.spacing.xl};
	width: 100%;
`;

const FullPageContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	position: fixed;
	inset: 0;
	background-color: ${(props) => props.theme.colors.background};
	z-index: ${(props) => props.theme.zIndex.modal};
`;
