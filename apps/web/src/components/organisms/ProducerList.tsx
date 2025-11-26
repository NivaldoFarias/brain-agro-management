import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { Producer } from "@agro/shared/types/producer.types";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";
import { LoadingState } from "../ui/LoadingState";

/** Props for the ProducerList component */
export interface ProducerListProps {
	/** Array of producers to display */
	producers?: Producer[];

	/** Whether data is loading */
	isLoading?: boolean;

	/** Error message if fetch failed */
	error?: string;

	/** Callback for retrying failed request */
	onRetry?: () => void;

	/** Callback when delete button is clicked */
	onDelete?: (id: string) => void;

	/** Whether delete operation is in progress */
	isDeletingId?: string;
}

/**
 * List component for displaying producers with actions.
 *
 * Handles loading, error, and empty states automatically.
 * Provides edit and delete actions for each producer.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useGetProducersQuery();
 * const [deleteProducer] = useDeleteProducerMutation();
 *
 * <ProducerList
 *   producers={data?.data}
 *   isLoading={isLoading}
 *   error={error?.message}
 *   onRetry={refetch}
 *   onDelete={(id) => deleteProducer(id)}
 * />
 * ```
 */
export function ProducerList({
	producers = [],
	isLoading = false,
	error,
	onRetry,
	onDelete,
	isDeletingId,
}: ProducerListProps): ReactElement {
	const navigate = useNavigate();

	if (isLoading) {
		return <LoadingState message="Loading producers..." />;
	}

	if (error) {
		return <ErrorMessage message={error} onRetry={onRetry} />;
	}

	if (producers.length === 0) {
		return (
			<EmptyState
				title="No producers yet"
				description="Create your first producer to get started managing your farms"
				icon="👤"
				action={
					<Button
						variant="primary"
						onClick={() => {
							void navigate("/producers/create");
						}}
					>
						Create Producer
					</Button>
				}
			/>
		);
	}

	return (
		<ListContainer>
			{producers.map((producer) => (
				<Card key={producer.id} padding="md">
					<CardContent>
						<ProducerInfo>
							<ProducerName>{producer.name}</ProducerName>
							<ProducerDocument>{producer.document}</ProducerDocument>
							<ProducerMeta>Created: {new Date(producer.createdAt).toLocaleDateString()}</ProducerMeta>
						</ProducerInfo>
						<ActionButtons>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									void navigate(`/producers/${producer.id}/edit`);
								}}
							>
								Edit
							</Button>
							<Button
								variant="danger"
								size="sm"
								onClick={() => onDelete?.(producer.id)}
								disabled={isDeletingId === producer.id}
								isLoading={isDeletingId === producer.id}
							>
								Delete
							</Button>
						</ActionButtons>
					</CardContent>
				</Card>
			))}
		</ListContainer>
	);
}

const ListContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.md};
`;

const CardContent = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: ${(props) => props.theme.spacing.lg};

	@media (max-width: ${(props) => props.theme.breakpoints.sm}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

const ProducerInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.xs};
	flex: 1;
`;

const ProducerName = styled.h3`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.lg};
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.text};
`;

const ProducerDocument = styled.p`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.textSecondary};
	font-family: ${(props) => props.theme.typography.fontFamily.mono};
`;

const ProducerMeta = styled.p`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};
`;

const ActionButtons = styled.div`
	display: flex;
	gap: ${(props) => props.theme.spacing.sm};

	@media (max-width: ${(props) => props.theme.breakpoints.sm}) {
		width: 100%;
		justify-content: flex-end;
	}
`;
