import { Button, Flex, Skeleton, Table, Text } from "@radix-ui/themes";
import { BadgeXIcon as DeleteIcon, SquarePenIcon as EditIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import type { ReactElement } from "react";

import type { Producer } from "@agro/shared/types";

import { PaginationControls } from "../atoms/";
import { EmptyState } from "../ui/EmptyState";
import { ErrorMessage } from "../ui/ErrorMessage";

/** Props for the {@link ProducerList} component */
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

	/** Current page number (1-indexed) */
	page?: number;

	/** Total number of items */
	total?: number;

	/** Number of items per page */
	limit?: number;

	/** Callback when page changes */
	onPageChange?: (page: number) => void;
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
	page = 1,
	total = 0,
	limit = 10,
	onPageChange,
}: ProducerListProps): ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const totalPages = Math.ceil(total / limit);
	const showPagination = total > limit;

	if (error) {
		return <ErrorMessage message={error} onRetry={onRetry} />;
	}

	if (!isLoading && producers.length === 0) {
		return (
			<EmptyState
				title={t(($) => $.producers.noProducers)}
				description={t(($) => $.producers.registerNewProducer)}
				icon="👤"
				action={
					<Button
						onClick={() => {
							void navigate("/producers/create");
						}}
					>
						{t(($) => $.producers.createProducer)}
					</Button>
				}
			/>
		);
	}

	return (
		<Flex direction="column" gap="4">
			<Table.Root variant="surface" size="2">
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeaderCell>{t(($) => $.producers.name)}</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>{t(($) => $.producers.document)}</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>{t(($) => $.form.createdAt)}</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>{t(($) => $.common.actions)}</Table.ColumnHeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{isLoading ?
						<LoadingState />
					:	producers.map((producer) => ProducerDataRow(producer))}
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

	function ProducerDataRow(producer: Producer) {
		return (
			<Table.Row key={producer.id}>
				<Table.RowHeaderCell>
					<Text>{producer.name}</Text>
				</Table.RowHeaderCell>
				<Table.Cell>
					<Text size="2" color="gray">
						{producer.document}
					</Text>
				</Table.Cell>
				<Table.Cell>
					<Text size="2">{new Date(producer.createdAt).toLocaleDateString()}</Text>
				</Table.Cell>
				<Table.Cell>
					<Flex gap="2">
						<Button
							variant="soft"
							size="1"
							onClick={() => {
								void navigate(`/producers/${producer.id}/edit`);
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
							onClick={() => onDelete?.(producer.id)}
							disabled={isDeletingId === producer.id}
							loading={isDeletingId === producer.id}
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
							{t(($) => $.common.loading)} {t(($) => $.producers.name)}
						</Text>
					</Skeleton>
				</Table.Cell>
				<Table.Cell>
					<Skeleton>
						<Text>
							{t(($) => $.common.loading)} {t(($) => $.producers.document)}
						</Text>
					</Skeleton>
				</Table.Cell>
				<Table.Cell>
					<Skeleton>
						<Text>--/--/----</Text>
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
