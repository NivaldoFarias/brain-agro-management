import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { Farm } from "@agro/shared/types/farm.types";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";
import { LoadingState } from "../ui/LoadingState";

/** Props for the FarmList component */
export interface FarmListProps {
	/** Array of farms to display */
	farms?: Farm[];

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
 * List component for displaying farms with actions.
 *
 * Handles loading, error, and empty states automatically.
 * Provides edit and delete actions for each farm.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useGetFarmsQuery();
 * const [deleteFarm] = useDeleteFarmMutation();
 *
 * <FarmList
 *   farms={data?.data}
 *   isLoading={isLoading}
 *   error={error?.message}
 *   onRetry={refetch}
 *   onDelete={(id) => deleteFarm(id)}
 * />
 * ```
 */
export function FarmList({
	farms = [],
	isLoading = false,
	error,
	onRetry,
	onDelete,
	isDeletingId,
}: FarmListProps): ReactElement {
	const navigate = useNavigate();

	if (isLoading) {
		return <LoadingState message="Loading farms..." />;
	}

	if (error) {
		return <ErrorMessage message={error} onRetry={onRetry} />;
	}

	if (farms.length === 0) {
		return (
			<EmptyState
				title="No farms yet"
				description="Create your first farm to start tracking agricultural properties"
				icon="🌾"
				action={
					<Button
						variant="primary"
						onClick={() => {
							void navigate("/farms/create");
						}}
					>
						Create Farm
					</Button>
				}
			/>
		);
	}

	return (
		<ListContainer>
			{farms.map((farm) => (
				<Card key={farm.id} padding="md">
					<CardContent>
						<FarmInfo>
							<FarmName>{farm.name}</FarmName>
							<FarmLocation>
								{farm.city}, {farm.state}
							</FarmLocation>
							<FarmAreas>
								<AreaBadge>
									<strong>Total:</strong> {farm.totalArea.toFixed(2)} ha
								</AreaBadge>
								<AreaBadge>
									<strong>Arable:</strong> {farm.arableArea.toFixed(2)} ha
								</AreaBadge>
								<AreaBadge>
									<strong>Vegetation:</strong> {farm.vegetationArea.toFixed(2)} ha
								</AreaBadge>
							</FarmAreas>
							<CropsList>
								<strong>Crops:</strong> {farm.crops && farm.crops.length > 0 ? farm.crops.join(", ") : "None"}
							</CropsList>
						</FarmInfo>
						<ActionButtons>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									void navigate(`/farms/${farm.id}/edit`);
								}}
							>
								Edit
							</Button>
							<Button
								variant="danger"
								size="sm"
								onClick={() => onDelete?.(farm.id)}
								disabled={isDeletingId === farm.id}
								isLoading={isDeletingId === farm.id}
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
	align-items: flex-start;
	gap: ${(props) => props.theme.spacing.lg};

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		flex-direction: column;
	}
`;

const FarmInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.sm};
	flex: 1;
`;

const FarmName = styled.h3`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.lg};
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.text};
`;

const FarmLocation = styled.p`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.textSecondary};
`;

const FarmAreas = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: ${(props) => props.theme.spacing.sm};
	margin-top: ${(props) => props.theme.spacing.xs};
`;

const AreaBadge = styled.span`
	padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
	font-size: ${(props) => props.theme.typography.fontSize.xs};
	color: ${(props) => props.theme.colors.text};
	background-color: ${(props) => props.theme.colors.backgroundAlt};
	border-radius: ${(props) => props.theme.borderRadius.md};
	font-family: ${(props) => props.theme.typography.fontFamily.mono};

	strong {
		font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	}
`;

const CropsList = styled.p`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};

	strong {
		font-weight: ${(props) => props.theme.typography.fontWeight.medium};
		color: ${(props) => props.theme.colors.text};
	}
`;

const ActionButtons = styled.div`
	display: flex;
	gap: ${(props) => props.theme.spacing.sm};

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		width: 100%;
		justify-content: flex-end;
	}
`;
