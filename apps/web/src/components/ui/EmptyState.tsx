import styled from "styled-components";

import type { HTMLAttributes, ReactElement, ReactNode } from "react";

/** Props for the EmptyState component */
export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
	/** Title text */
	title: string;

	/** Description text */
	description?: string;

	/** Icon or illustration */
	icon?: ReactNode;

	/** Call to action button */
	action?: ReactNode;
}

/**
 * Empty state component for lists with no data.
 *
 * Provides guidance when collections are empty with optional CTA.
 * Improves user experience by explaining absence of data.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No producers yet"
 *   description="Create your first producer to get started"
 *   icon={<UserIcon />}
 *   action={<Button onClick={handleCreate}>Create Producer</Button>}
 * />
 * ```
 */
export function EmptyState({ title, description, icon, action, ...props }: EmptyStateProps): ReactElement {
	return (
		<Container {...props}>
			{icon && <IconContainer>{icon}</IconContainer>}
			<Title>{title}</Title>
			{description && <Description>{description}</Description>}
			{action && <ActionContainer>{action}</ActionContainer>}
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.lg};
	text-align: center;
	gap: ${(props) => props.theme.spacing.md};
	min-height: 300px;
`;

const IconContainer = styled.div`
	font-size: 64px;
	color: ${(props) => props.theme.colors.textSecondary};
	opacity: 0.5;
`;

const Title = styled.h3`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.lg};
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.text};
	line-height: ${(props) => props.theme.typography.lineHeight.tight};
`;

const Description = styled.p`
	margin: 0;
	max-width: 400px;
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.textSecondary};
	line-height: ${(props) => props.theme.typography.lineHeight.normal};
`;

const ActionContainer = styled.div`
	margin-top: ${(props) => props.theme.spacing.md};
`;
