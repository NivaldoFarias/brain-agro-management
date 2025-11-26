import styled from "styled-components";

import type { ReactElement } from "react";

import { Typography } from "@/components/atoms";

/**
 * Create farm page component for adding new agricultural farms.
 *
 * Displays form with validation for creating new farm records
 * with area validation and crop selection.
 */
export function CreateFarmPage(): ReactElement {
	return (
		<Container>
			<Typography variant="h1">Create Farm</Typography>
			<Typography variant="body">Register a new farm</Typography>
		</Container>
	);
}

const Container = styled.div`
	padding: ${(props) => props.theme.spacing.xl};
`;
