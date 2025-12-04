import { Badge, Button, Flex, Skeleton, Table, Text } from "@radix-ui/themes";
import { BadgeXIcon as DeleteIcon, SquarePenIcon as EditIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import type { ReactElement } from "react";

import type { Farm } from "@agro/shared/types";

import { CropType } from "@agro/shared/enums";

import { PaginationControls } from "../atoms/";
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

	/**
	 * Current page number
	 *
	 * @default 1
	 */
	page?: number;

	/** Total number of items */
	total?: number;

	/** Number of items per page */
	limit?: number;

	/** Callback when page changes */
	onPageChange?: (page: number) => void;
}

/**
 * List component for displaying farms with actions.
 *
 * Handles loading, error, and empty states automatically.
 * Provides edit and delete actions for each farm in a table format.
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
	page = 1,
	total = 0,
	limit = 10,
	onPageChange,
}: FarmListProps): ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const totalPages = Math.ceil(total / limit);
	const showPagination = total > limit;

	if (error) {
		return <ErrorMessage message={error} onRetry={onRetry} />;
	}

	if (!isLoading && farms.length === 0) {
		return (
			<EmptyState
				title={t(($) => $.farms.noFarms)}
				description={t(($) => $.farms.createFirstFarm)}
				icon="🌾"
				action={
					<Button
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

	const cropToColor: Record<CropType, "blue" | "green" | "orange" | "gray" | "red"> = {
		[CropType.Corn]: "green",
		[CropType.Soy]: "blue",
		[CropType.Coffee]: "orange",
		[CropType.Sugarcane]: "gray",
		[CropType.Cotton]: "red",
	};

	return (
		<Flex direction="column" gap="4">
			<Table.Root variant="surface" size="2">
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeaderCell>{t(($) => $.farms.name)}</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>{t(($) => $.farms.city)}</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>{t(($) => $.dashboard.totalArea)}</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>{t(($) => $.dashboard.arable)}</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>{t(($) => $.dashboard.vegetation)}</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>{t(($) => $.dashboard.crops)}</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>{t(($) => $.common.actions)}</Table.ColumnHeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{isLoading ?
						<LoadingState />
					:	farms.map((farm) => FarmDataRow(farm))}
				</Table.Body>
			</Table.Root>

			{showPagination ?
				<PaginationControls
					page={page}
					total={total}
					isLoading={isLoading}
					totalPages={totalPages}
					onPageChange={onPageChange}
				/>
			:	null}
		</Flex>
	);

	function FarmDataRow(farm: Farm) {
		return (
			<Table.Row key={farm.id}>
				<Table.RowHeaderCell>
					<Text>{farm.name}</Text>
				</Table.RowHeaderCell>
				<Table.Cell>
					<Text size="2" color="gray">
						{farm.city}, {t(($) => $.states[farm.state])}
					</Text>
				</Table.Cell>
				<Table.Cell>
					<Text size="2">
						{farm.totalArea.toFixed(2)} {t(($) => $.abbreviations.hectares)}
					</Text>
				</Table.Cell>
				<Table.Cell>
					<Text size="2">
						{farm.arableArea.toFixed(2)} {t(($) => $.abbreviations.hectares)}
					</Text>
				</Table.Cell>
				<Table.Cell>
					<Text size="2">
						{farm.vegetationArea.toFixed(2)} {t(($) => $.abbreviations.hectares)}
					</Text>
				</Table.Cell>
				<Table.Cell>
					{farm.crops.length > 0 ?
						<Flex gap="1" wrap="wrap">
							{farm.crops.map((crop, index) => (
								<Badge key={index} color={cropToColor[crop]} variant="soft" size="1">
									{t(($) => $.crops[crop])}
								</Badge>
							))}
						</Flex>
					:	<Text size="2" color="gray">
							{t(($) => $.common.none)}
						</Text>
					}
				</Table.Cell>
				<Table.Cell>
					<Flex gap="2">
						<Button
							variant="soft"
							size="1"
							onClick={() => {
								void navigate(`/farms/${farm.id}/edit`);
							}}
						>
							<Flex>
								<EditIcon size={16} aria-hidden="true" style={{ marginRight: 4 }} />
								{t(($) => $.common.edit)}
							</Flex>
						</Button>
						<Button
							color="red"
							variant="soft"
							size="1"
							onClick={() => onDelete?.(farm.id)}
							disabled={isDeletingId === farm.id}
							loading={isDeletingId === farm.id}
						>
							<Flex>
								<DeleteIcon size={16} aria-hidden="true" style={{ marginRight: 4 }} />
								{t(($) => $.common.delete)}
							</Flex>
						</Button>
					</Flex>
				</Table.Cell>
			</Table.Row>
		);
	}

	function LoadingState() {
		return Array.from({ length: 20 }).map((_, index) => (
			<Table.Row key={index}>
				<Table.Cell>
					<Skeleton>
						<Text>
							{t(($) => $.common.loading)} {t(($) => $.farms.name)}
						</Text>
					</Skeleton>
				</Table.Cell>
				<Table.Cell>
					<Skeleton>
						<Text>
							{t(($) => $.common.loading)} {t(($) => $.farms.city)}
						</Text>
					</Skeleton>
				</Table.Cell>
				<Table.Cell>
					<Skeleton>
						<Text>000.00 {t(($) => $.abbreviations.hectares)}</Text>
					</Skeleton>
				</Table.Cell>
				<Table.Cell>
					<Skeleton>
						<Text>000.00 {t(($) => $.abbreviations.hectares)}</Text>
					</Skeleton>
				</Table.Cell>
				<Table.Cell>
					<Skeleton>
						<Text>000.00 {t(($) => $.abbreviations.hectares)}</Text>
					</Skeleton>
				</Table.Cell>
				<Table.Cell>
					<Skeleton>
						<Flex gap="1">
							<Badge>{t(($) => $.common.loading)}</Badge>
						</Flex>
					</Skeleton>
				</Table.Cell>
				<Table.Cell>
					<Skeleton>
						<Flex gap="2">
							<Button disabled={true} size="1">
								{t(($) => $.common.edit)}
							</Button>
						</Flex>
					</Skeleton>
				</Table.Cell>
			</Table.Row>
		));
	}
}
