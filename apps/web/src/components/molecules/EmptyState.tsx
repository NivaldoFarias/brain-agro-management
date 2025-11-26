import styled from "styled-components";

import type { ReactElement, ReactNode } from "react";

import { Typography } from "../atoms";

/** Props for the EmptyState component */
export interface EmptyStateProps {
	/** Icon or illustration element */
	icon?: ReactNode;

	/** Empty state title */
	title: string;

	/** Empty state description */
	description?: string;

	/** Call-to-action element (e.g., Button) */
	action?: ReactNode;
}

/**
 * Empty state component for collections with no data.
 *
 * Provides user-friendly feedback when lists or tables are empty,
 * with optional call-to-action for creating first item.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<FarmIcon />}
 *   title="No farms yet"
 *   description="Create your first farm to start managing agricultural data."
 *   action={
 *     <Button variant="primary" onClick={handleCreate}>
 *       Create Farm
 *     </Button>
 *   }
 * />
 * ```
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps): ReactElement {
	return (
		<Container>
			{icon && <IconContainer>{icon}</IconContainer>}
			<Typography variant="h3" align="center">
				{title}
			</Typography>
			{description && (
				<Typography variant="body" align="center" color="textSecondary">
					{description}
				</Typography>
			)}
			{action && <ActionContainer>{action}</ActionContainer>}
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: ${(props) => props.theme.spacing.md};
	padding: ${(props) => props.theme.spacing["3xl"]} ${(props) => props.theme.spacing.xl};
	text-align: center;
`;

const IconContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64px;
	height: 64px;
	color: ${(props) => props.theme.colors.textSecondary};
	margin-bottom: ${(props) => props.theme.spacing.md};

	svg {
		width: 100%;
		height: 100%;
	}
`;

const ActionContainer = styled.div`
	margin-top: ${(props) => props.theme.spacing.md};
`;
