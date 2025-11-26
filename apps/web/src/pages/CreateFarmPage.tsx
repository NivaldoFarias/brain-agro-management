import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import type { ReactElement } from "react";

import type { CreateFarmFormData } from "@/schemas";

import { Typography } from "@/components/atoms";
import { Card, EmptyState, LoadingState } from "@/components/ui/";
import { FarmForm } from "@/features";
import { useCreateFarmMutation, useGetProducersQuery } from "@/store/api";
import { ROUTES } from "@/utils/";

/**
 * Create farm page component for adding new agricultural farms.
 *
 * Displays form with validation for creating new farm records
 * with area validation and crop selection.
 */
export function CreateFarmPage(): ReactElement {
	const navigate = useNavigate();
	const [selectedProducerId, setSelectedProducerId] = useState<string>("");

	const { data: producersData, isLoading: isLoadingProducers } = useGetProducersQuery({
		page: 1,
		limit: 100,
	});
	const [createFarm, { isLoading: isCreating }] = useCreateFarmMutation();

	const handleSubmit = async (data: CreateFarmFormData) => {
		try {
			await createFarm(data).unwrap();
			// TODO: Show success toast when Toast component is ready
			void navigate(ROUTES.farms.list);
		} catch (error) {
			console.error("Failed to create farm:", error);
			// TODO: Show error toast when Toast component is ready
			alert("Failed to create farm. Please try again.");
		}
	};

	if (isLoadingProducers) {
		return (
			<Container>
				<LoadingState message="Loading producers..." />
			</Container>
		);
	}

	if (!producersData || producersData.data.length === 0) {
		return (
			<Container>
				<EmptyState
					title="No producers available"
					description="You need to create at least one producer before creating a farm"
					action={
						<button
							onClick={() => {
								void navigate(ROUTES.producers.create);
							}}
							style={{ cursor: "pointer" }}
						>
							Create Producer
						</button>
					}
				/>
			</Container>
		);
	}

	return (
		<Container>
			<Header>
				<Typography variant="h1">Create Farm</Typography>
				<Typography variant="body">Register a new agricultural property</Typography>
			</Header>

			<FormCard>
				<FarmForm
					producerId={(selectedProducerId || producersData.data[0]?.id) ?? ""}
					onSubmit={handleSubmit}
					isLoading={isCreating}
					submitLabel="Create Farm"
				/>
			</FormCard>
		</Container>
	);
}

const Container = styled.div`
	padding: ${(props) => props.theme.spacing.xl};
	max-width: 900px;
	margin: 0 auto;
`;

const Header = styled.div`
	margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const FormCard = styled(Card)`
	padding: ${(props) => props.theme.spacing.xl};
`;
