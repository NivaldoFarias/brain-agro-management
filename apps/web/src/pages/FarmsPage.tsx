import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import { Typography } from "@/components/atoms";
import { Button, ConfirmDialog } from "@/components/ui/";
import { useToast } from "@/contexts/ToastContext";
import { FarmList } from "@/features";
import { useDeleteFarmMutation, useGetFarmsQuery } from "@/store/api";
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
	const [deletingId, setDeletingId] = useState<string | undefined>();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [farmToDelete, setFarmToDelete] = useState<string | undefined>();

	const { data: farms, isLoading, error, refetch } = useGetFarmsQuery({ page, limit: 10 });
	const [deleteFarm] = useDeleteFarmMutation();

	const handleCreate = () => {
		void navigate(ROUTES.farms.create);
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
		<Container>
			<Header>
				<div>
					<Typography variant="h1">{t(($) => $.farms.title)}</Typography>
					<Typography variant="body">{t(($) => $.farms.subtitle)}</Typography>
				</div>
				<Button variant="primary" onClick={handleCreate}>
					{t(($) => $.farms.createFarm)}
				</Button>
			</Header>

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
		</Container>
	);
}

const Container = styled.div`
	padding: ${(props) => props.theme.spacing.xl};
	max-width: 1400px;
	margin: 0 auto;
`;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: ${(props) => props.theme.spacing.xl};
	gap: ${(props) => props.theme.spacing.md};

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		flex-direction: column;
		align-items: stretch;
	}
`;
