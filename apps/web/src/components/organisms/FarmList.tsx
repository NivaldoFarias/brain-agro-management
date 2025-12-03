import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { BadgeVariant } from "../ui";
import type { ReactElement } from "react";

import type { Farm } from "@agro/shared/types";

import { CropType } from "@agro/shared/utils";

import { Badge } from "../ui";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";

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
	const { t } = useTranslation();
	const navigate = useNavigate();

	if (isLoading) {
		return (
			<ListContainer>
				{Array.from({ length: 5 }).map((_, index) => (
					<SkeletonCard key={index} />
				))}
			</ListContainer>
		);
	}

	if (error) {
		return <ErrorMessage message={error} onRetry={onRetry} />;
	}

	if (farms.length === 0) {
		return (
			<EmptyState
				title={t(($) => $.farms.noFarms)}
				description={t(($) => $.farms.createFirstFarm)}
				icon="🌾"
				action={
					<Button
						variant="primary"
						onClick={() => {
							void navigate("/farms/create");
						}}
					>
						{t(($) => $.farms.createFarm)}
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
								{farm.city}, {t(($) => $.states[farm.state])}
							</FarmLocation>
							<FarmAreas>
								<AreaBadge>
									<strong>{t(($) => $.dashboard.totalArea)}:</strong> {farm.totalArea.toFixed(2)}{" "}
									{t(($) => $.abbreviations.hectares)}
								</AreaBadge>
								<AreaBadge>
									<strong>{t(($) => $.dashboard.arable)}:</strong> {farm.arableArea.toFixed(2)}{" "}
									{t(($) => $.abbreviations.hectares)}
								</AreaBadge>
								<AreaBadge>
									<strong>{t(($) => $.dashboard.vegetation)}:</strong> {farm.vegetationArea.toFixed(2)}{" "}
									{t(($) => $.abbreviations.hectares)}
								</AreaBadge>
							</FarmAreas>
							<CropsList>
								<strong>{t(($) => $.dashboard.crops)}:</strong>{" "}
								{farm.crops.length > 0 ?
									<CropsContainer>
										{farm.crops.map((crop, index) => {
											const cropToVariant: Record<CropType, BadgeVariant> = {
												[CropType.Corn]: "success",
												[CropType.Soy]: "info",
												[CropType.Coffee]: "warning",
												[CropType.Sugarcane]: "default",
												[CropType.Cotton]: "error",
											};

											return (
												<Badge key={index} variant={cropToVariant[crop]}>
													<strong>{t(($) => $.crops[crop])}</strong>
												</Badge>
											);
										})}
									</CropsContainer>
								:	t(($) => $.common.none)}
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
								{t(($) => $.common.edit)}
							</Button>
							<Button
								variant="danger"
								size="sm"
								onClick={() => onDelete?.(farm.id)}
								disabled={isDeletingId === farm.id}
								isLoading={isDeletingId === farm.id}
							>
								{t(($) => $.common.delete)}
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
	display: flex;
	flex-direction: row;
	align-items: baseline;
	flex-wrap: wrap;
	gap: ${(props) => props.theme.spacing.xs};

	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};

	strong {
		font-weight: ${(props) => props.theme.typography.fontWeight.medium};
		color: ${(props) => props.theme.colors.text};
	}
`;

const CropsContainer = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: ${(props) => props.theme.spacing.sm};
	align-items: center;
`;

const ActionButtons = styled.div`
	display: flex;
	gap: ${(props) => props.theme.spacing.sm};

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		width: 100%;
		justify-content: flex-end;
	}
`;

const SkeletonCard = styled.div`
	padding: ${(props) => props.theme.spacing.md};
	background: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => props.theme.colors.border};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	box-shadow: ${(props) => props.theme.shadows.sm};
	min-height: 180px;
	background: linear-gradient(
		90deg,
		${(props) => props.theme.colors.backgroundAlt} 25%,
		${(props) => props.theme.colors.surface} 50%,
		${(props) => props.theme.colors.backgroundAlt} 75%
	);
	background-size: 200% 100%;
	animation: shimmer 2s infinite;

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
`;
