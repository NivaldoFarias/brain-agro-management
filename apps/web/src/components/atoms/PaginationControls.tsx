import { Button, Flex, Text } from "@radix-ui/themes";
import {
	SquareChevronRightIcon as NextPageIcon,
	SquareChevronLeftIcon as PreviousPageIcon,
	ChevronsRightIcon as LastPageIcon,
	ChevronsLeftIcon as FirstPageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/** Props for the {@link PaginationControls} component */
export interface PaginationComponentProps {
	page: number;
	totalPages: number;
	total: number;
	onPageChange?: (page: number) => void;
	isLoading: boolean;
}

export function PaginationControls({
	isLoading,
	onPageChange,
	page,
	total,
	totalPages,
}: {
	page: number;
	totalPages: number;
	total: number;
	onPageChange: ((page: number) => void) | undefined;
	isLoading: boolean;
}) {
	const { t } = useTranslation();

	return (
		<Flex justify="between" align="center" gap="4" wrap="wrap">
			<Text size="2" color="gray">
				{t(($) => $.common.page)} {page} {t(($) => $.common.of)} {totalPages}{" "}
				<i>
					({t(($) => $.common.total)} {t(($) => $.common.of)} {total})
				</i>
			</Text>
			<Flex gap="2">
				<Button variant="soft" size="2" onClick={() => onPageChange?.(1)} disabled={page === 1 || isLoading}>
					<Flex align="center" gap="2">
						<FirstPageIcon size={18} aria-hidden="true" />
						{t(($) => $.common.first)}
					</Flex>
				</Button>
				<Button variant="soft" size="2" onClick={() => onPageChange?.(page - 1)} disabled={page === 1 || isLoading}>
					<Flex align="center" gap="2">
						{t(($) => $.common.previous)}
						<PreviousPageIcon size={18} aria-hidden="true" />
					</Flex>
				</Button>
				<Button
					variant="soft"
					size="2"
					onClick={() => onPageChange?.(page + 1)}
					disabled={page >= totalPages || isLoading}
				>
					<Flex align="center" gap="2">
						<NextPageIcon size={18} aria-hidden="true" />
						{t(($) => $.common.next)}
					</Flex>
				</Button>
				<Button variant="soft" size="2" onClick={() => onPageChange?.(totalPages)} disabled={page >= totalPages || isLoading}>
					<Flex align="center" gap="2">
						{t(($) => $.common.last)}
						<LastPageIcon size={18} aria-hidden="true" />
					</Flex>
				</Button>
			</Flex>
		</Flex>
	);
}
