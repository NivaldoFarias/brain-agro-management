import { Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { ProducersFilterOptions } from "@agro/shared/types";

import { ProducerSortField, SortOrder } from "@agro/shared/enums";

import { FilterControls, Typography } from "@/components/atoms";
import { PageContainer } from "@/components/templates/PageContainer";
import { Button, ConfirmDialog } from "@/components/ui/";
import { useToast } from "@/contexts/ToastContext";
import { ProducerList } from "@/features";
import { useDeleteProducerMutation, useGetProducersQuery } from "@/store/api";
import { ROUTES } from "@/utils/";

/**
 * Producers list page component displaying all rural producers.
 *
 * Shows table/list of producers with search, filtering, and pagination.
 * Provides actions for creating, editing, and deleting producers.
 */
export function ProducersPage(): ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const toast = useToast();
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<ProducersFilterOptions>({
		sortBy: ProducerSortField.Name,
		sortOrder: SortOrder.Ascending,
	});
	const [deletingId, setDeletingId] = useState<string | undefined>();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [producerToDelete, setProducerToDelete] = useState<string | undefined>();

	const {
		data: producers,
		isLoading,
		error,
	} = useGetProducersQuery({
		page,
		limit: 10,
		...filters,
	});
	const [deleteProducer] = useDeleteProducerMutation();

	const handleCreate = () => {
		void navigate(ROUTES.producers.create);
	};

	const handleFiltersChange = (newFilters: ProducersFilterOptions) => {
		setFilters(newFilters);
		setPage(1);
	};

	const handleDeleteClick = (id: string) => {
		setProducerToDelete(id);
		setConfirmOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!producerToDelete) return;

		try {
			setDeletingId(producerToDelete);
			await deleteProducer(producerToDelete).unwrap();
			toast.success(t(($) => $.producers.deleteSuccess));
		} catch (error) {
			console.error("Failed to delete producer:", error);
			toast.error(
				t(($) => $.producers.deleteError),
				t(($) => $.common.retry),
			);
		} finally {
			setDeletingId(undefined);
			setProducerToDelete(undefined);
		}
	};

	return (
		<PageContainer>
			<Flex direction="column" gap="2">
				<Flex justify="between" align="start" mb="4" gap="2">
					<Flex direction="column" gap="2">
						<Heading as="h1" size="8">
							{t(($) => $.producers.title)}
						</Heading>
						<Heading as="h2" size="2" weight="regular">
							{t(($) => $.producers.subtitle)}
						</Heading>
					</Flex>
					<Button variant="primary" onClick={handleCreate}>
						{t(($) => $.producers.createProducer)}
					</Button>
				</Flex>

				<FilterControls
					type="producers"
					filters={filters}
					onFiltersChange={handleFiltersChange}
					isLoading={isLoading}
				/>

				<ProducerList
					producers={producers?.data ?? []}
					isLoading={isLoading}
					error={error ? t(($) => $.producers.loadError) : undefined}
					onDelete={handleDeleteClick}
					isDeletingId={deletingId}
					page={page}
					total={producers?.total ?? 0}
					limit={producers?.limit ?? 10}
					onPageChange={setPage}
				/>

				<ConfirmDialog
					open={confirmOpen}
					onOpenChange={setConfirmOpen}
					title={t(($) => $.producers.deleteProducer)}
					description={t(($) => $.producers.deleteConfirm)}
					confirmText={t(($) => $.common.delete)}
					cancelText={t(($) => $.common.cancel)}
					color="red"
					onConfirm={() => {
						void handleDeleteConfirm();
					}}
					isLoading={!!deletingId}
				/>
			</Flex>
		</PageContainer>
	);
}
