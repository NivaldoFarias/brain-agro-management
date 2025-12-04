import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import { Typography } from "@/components/atoms";
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
	const [deletingId, setDeletingId] = useState<string | undefined>();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [producerToDelete, setProducerToDelete] = useState<string | undefined>();

	const { data: producers, isLoading, error } = useGetProducersQuery({ page, limit: 10 });
	const [deleteProducer] = useDeleteProducerMutation();

	const handleCreate = () => {
		void navigate(ROUTES.producers.create);
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
			<Container>
				<Header>
					<div>
						<Typography variant="h1">{t(($) => $.producers.title)}</Typography>
						<Typography variant="body">{t(($) => $.producers.subtitle)}</Typography>
					</div>
					<Button variant="primary" onClick={handleCreate}>
						{t(($) => $.producers.createProducer)}
					</Button>
				</Header>{" "}
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
			</Container>
		</PageContainer>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.xl};
`;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: ${(props) => props.theme.spacing.md};

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		flex-direction: column;
		align-items: stretch;
	}
`;

const PaginationContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: ${(props) => props.theme.spacing.md};
	margin-top: ${(props) => props.theme.spacing.xl};
`;
