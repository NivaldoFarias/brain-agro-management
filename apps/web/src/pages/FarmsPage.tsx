import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import { Typography } from "@/components/atoms";
import { Button } from "@/components/ui/";
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
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [deletingId, setDeletingId] = useState<string | undefined>();

	const { data, isLoading, error, refetch } = useGetFarmsQuery({ page, limit: 10 });
	const [deleteFarm] = useDeleteFarmMutation();

	const handleCreate = () => {
		void navigate(ROUTES.farms.create);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this farm?")) {
			return;
		}

		try {
			setDeletingId(id);
			await deleteFarm(id).unwrap();
		} catch (error) {
			console.error("Failed to delete farm:", error);
			alert("Failed to delete farm. Please try again.");
		} finally {
			setDeletingId(undefined);
		}
	};

	return (
		<Container>
			<Header>
				<div>
					<Typography variant="h1">Farms</Typography>
					<Typography variant="body">Manage agricultural farms</Typography>
				</div>
				<Button variant="primary" onClick={handleCreate}>
					Create Farm
				</Button>
			</Header>

			<FarmList
				farms={data?.data ?? []}
				isLoading={isLoading}
				error={error ? "Failed to load farms" : undefined}
				onRetry={() => {
					void refetch();
				}}
				onDelete={(id) => {
					void handleDelete(id);
				}}
				isDeletingId={deletingId}
			/>

			{data && data.total > 10 && (
				<PaginationContainer>
					<Button
						variant="secondary"
						onClick={() => {
							setPage((page) => Math.max(1, page - 1));
						}}
						disabled={page === 1}
					>
						Previous
					</Button>
					<Typography variant="body">
						Page {page} of {Math.ceil(data.total / 10)}
					</Typography>
					<Button
						variant="secondary"
						onClick={() => {
							setPage((page) => page + 1);
						}}
						disabled={page >= Math.ceil(data.total / 10)}
					>
						Next
					</Button>
				</PaginationContainer>
			)}
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

const PaginationContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: ${(props) => props.theme.spacing.md};
	margin-top: ${(props) => props.theme.spacing.xl};
`;
