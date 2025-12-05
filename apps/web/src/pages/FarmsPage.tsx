import { Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { FarmFilterOptions } from "@agro/shared/types";

import { FarmSortField, SortOrder } from "@agro/shared/enums";

import { FilterControls } from "@/components/atoms";
import { PageContainer } from "@/components/templates/PageContainer";
import { Button, ConfirmDialog } from "@/components/ui/";
import { useToast } from "@/contexts/ToastContext";
import { FarmList } from "@/features";
import { useDeleteFarmMutation, useGetFarmsQuery, useGetProducersQuery } from "@/store/api";
import { ROUTES } from "@/utils/";

/**
 * Farms list page component displaying all registered farms.
 *
 * Shows table/list of farms with associated producer information,
 * search, filtering, and pagination capabilities.
 */
export function FarmsPage(): ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const toast = useToast();
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<FarmFilterOptions>({
		sortBy: FarmSortField.Name,
		sortOrder: SortOrder.Ascending,
	});
	const [deletingId, setDeletingId] = useState<string | undefined>();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [farmToDelete, setFarmToDelete] = useState<string | undefined>();

	const {
		data: farms,
		isLoading,
		error,
		refetch,
	} = useGetFarmsQuery({
		page,
		limit: 10,
		...filters,
	});
	const { data: producersData } = useGetProducersQuery({ page: 1, limit: 100 });

	const [deleteFarm] = useDeleteFarmMutation();

	const handleCreate = () => {
		void navigate(ROUTES.farms.create);
	};

	const handleFiltersChange = (newFilters: FarmFilterOptions) => {
		setFilters(newFilters);
		setPage(1);
	};

	const handleDeleteClick = (id: string) => {
		setFarmToDelete(id);
		setConfirmOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!farmToDelete) return;

		try {
			setDeletingId(farmToDelete);
			await deleteFarm(farmToDelete).unwrap();
			toast.success(t(($) => $.farms.deleteSuccess));
		} catch (error) {
			console.error("Failed to delete farm:", error);
			toast.error(
				t(($) => $.farms.deleteError),
				t(($) => $.common.retry),
			);
		} finally {
			setDeletingId(undefined);
			setFarmToDelete(undefined);
		}
	};

	return (
		<PageContainer>
			<Flex direction="column" gap="2">
				<Flex justify="between" align="start" mb="4" gap="2">
					<Flex direction="column" gap="2">
						<Heading as="h1" size="8">
							{t(($) => $.farms.title)}
						</Heading>
						<Heading as="h2" size="2" weight="regular">
							{t(($) => $.farms.subtitle)}
						</Heading>
					</Flex>
					<Button variant="primary" onClick={handleCreate}>
						{t(($) => $.farms.createFarm)}
					</Button>
				</Flex>

				<FilterControls
					type="farms"
					filters={filters}
					onFiltersChange={handleFiltersChange}
					isLoading={isLoading}
					availableProducers={producersData?.data.map((producer) => ({
						id: producer.id,
						name: producer.name,
					}))}
				/>

				<FarmList
					farms={farms?.data ?? []}
					isLoading={isLoading}
					error={error ? t(($) => $.farms.loadError) : undefined}
					onRetry={() => {
						void refetch();
					}}
					onDelete={handleDeleteClick}
					isDeletingId={deletingId}
					page={page}
					total={farms?.total ?? 0}
					limit={farms?.limit ?? 10}
					onPageChange={setPage}
				/>

				<ConfirmDialog
					open={confirmOpen}
					onOpenChange={setConfirmOpen}
					title={t(($) => $.farms.deleteFarm)}
					description={t(($) => $.farms.deleteConfirm)}
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
