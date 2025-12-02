import styled from "styled-components";

import type { ReactElement, ReactNode } from "react";

/**
 * Props for the DashboardStatCard component
 */
interface DashboardStatCardProps {
	/**
	 * The label/title for the stat
	 */
	label: string;

	/**
	 * The main value to display
	 */
	value: string | number;

	/**
	 * Optional icon to display in the card
	 */
	icon?: ReactNode;

	/**
	 * Optional unit to display after the value
	 */
	unit?: string;

	/**
	 * Optional variant styling
	 */
	variant?: "default" | "success" | "warning" | "info";
}

/**
 * Displays a single dashboard statistic card with icon, value, and label.
 *
 * Used for metrics like total farms, total area, etc. on the dashboard.
 *
 * @example
 * ```tsx
 * <DashboardStatCard
 *   label="Total Farms"
 *   value={42}
 *   icon={<FarmIcon />}
 *   variant="success"
 * />
 * ```
 */
export function DashboardStatCard({
	label,
	value,
	icon,
	unit,
	variant = "default",
}: DashboardStatCardProps): ReactElement {
	return (
		<Card $variant={variant}>
			{icon && <IconContainer>{icon}</IconContainer>}
			<Content>
				<Label>{label}</Label>
				<Value>
					{value}
					{unit && <Unit>{unit}</Unit>}
				</Value>
			</Content>
		</Card>
	);
}

const Card = styled.div<{ $variant: string }>`
	display: flex;
	align-items: center;
	gap: ${(props) => props.theme.spacing.lg};
	padding: ${(props) => props.theme.spacing.xl};
	background: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => props.theme.colors.border};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	box-shadow: ${(props) => props.theme.shadows.sm};
	transition: ${(props) => props.theme.transitions.base};

	&:hover {
		box-shadow: ${(props) => props.theme.shadows.md};
		border-color: ${(props) => {
			switch (props.$variant) {
				case "success":
					return props.theme.colors.success;
				case "warning":
					return props.theme.colors.warning;
				case "info":
					return props.theme.colors.info;
				default:
					return props.theme.colors.borderFocus;
			}
		}};
	}

	@media (max-width: ${(props) => props.theme.breakpoints.md}) {
		gap: ${(props) => props.theme.spacing.md};
		padding: ${(props) => props.theme.spacing.lg};
	}
`;

const IconContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48px;
	height: 48px;
	background: ${(props) => props.theme.colors.primaryLight};
	border-radius: ${(props) => props.theme.borderRadius.lg};
	color: ${(props) => props.theme.colors.primary};
	flex-shrink: 0;

	svg {
		width: 24px;
		height: 24px;
	}
`;

const Content = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${(props) => props.theme.spacing.xs};
`;

const Label = styled.p`
	margin: 0;
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const Value = styled.div`
	display: flex;
	align-items: baseline;
	gap: ${(props) => props.theme.spacing.xs};
	font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
	font-weight: ${(props) => props.theme.typography.fontWeight.bold};
	color: ${(props) => props.theme.colors.text};
`;

const Unit = styled.span`
	font-size: ${(props) => props.theme.typography.fontSize.sm};
	color: ${(props) => props.theme.colors.textSecondary};
	font-weight: ${(props) => props.theme.typography.fontWeight.normal};
`;
