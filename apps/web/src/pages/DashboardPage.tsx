import { useTranslation } from "react-i18next";
import styled from "styled-components";

import type { ReactElement } from "react";

import { PageContainer } from "@/components/templates/PageContainer";
import { ChartIcon } from "@/components/ui/Icon";

/**
 * Dashboard page component displaying agricultural analytics.
 *
 * Shows total metrics, state distribution, crop distribution,
 * and land use statistics for all registered farms.
 */
export function DashboardPage(): ReactElement {
	const { t } = useTranslation();

	return (
		<PageContainer>
			<Container>
				<PageHeader>
					<Title>{t("dashboard.title")}</Title>
					<Subtitle>{t("dashboard.subtitle")}</Subtitle>
				</PageHeader>

				<PlaceholderContent>
					<ChartIcon size={48} strokeWidth={1.5} />
					<PlaceholderText>{t("common.loading")}</PlaceholderText>
					<PlaceholderDescription>{t("dashboard.noStats")}</PlaceholderDescription>
				</PlaceholderContent>
			</Container>
		</PageContainer>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.xl};
`;

const PageHeader = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.sm};
`;

const Title = styled.h1`
	font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
	font-weight: ${(props) => props.theme.typography.fontWeight.bold};
	color: ${(props) => props.theme.colors.text};
	margin: 0;
`;

const Subtitle = styled.p`
	font-size: ${(props) => props.theme.typography.fontSize.base};
	color: ${(props) => props.theme.colors.textSecondary};
	margin: 0;
`;

const PlaceholderContent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 400px;
	background: ${(props) => props.theme.colors.surface};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	border: 2px dashed ${(props) => props.theme.colors.border};
	padding: ${(props) => props.theme.spacing["2xl"]};
	gap: ${(props) => props.theme.spacing.md};
	color: ${(props) => props.theme.colors.textSecondary};
`;

const PlaceholderText = styled.p`
	font-size: ${(props) => props.theme.typography.fontSize.lg};
	font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
	color: ${(props) => props.theme.colors.text};
	margin: 0;
`;

const PlaceholderDescription = styled.p`
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};
	margin: 0;
	text-align: center;
`;
