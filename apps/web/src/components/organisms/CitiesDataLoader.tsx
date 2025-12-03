import { useEffect } from "react";

import type { ReactElement, ReactNode } from "react";

import { useLocalStorageContext } from "@/contexts/LocalStorageContext";
import { useGetCitiesByStateQuery } from "@/store/api/dashboardApi";
import { STORAGE_KEYS } from "@/utils/constants.util";

/**
 * Props for CitiesDataLoader component.
 */
interface CitiesDataLoaderProps {
	children: ReactNode;
}

/**
 * Component that fetches and caches cities data on mount.
 *
 * Loads all unique cities grouped by state from the API once
 * and stores them in localStorage for offline form support.
 * This data is used for cascading city selection in farm forms.
 *
 * @example
 * ```tsx
 * <CitiesDataLoader>
 *   <App />
 * </CitiesDataLoader>
 * ```
 */
export function CitiesDataLoader({ children }: CitiesDataLoaderProps): ReactElement {
	const storage = useLocalStorageContext();
	const { data: cities, isSuccess } = useGetCitiesByStateQuery(undefined);

	useEffect(() => {
		if (isSuccess && cities) {
			console.log("[CitiesDataLoader] Caching cities data in localStorage");
			storage.setItem(STORAGE_KEYS.citiesByState, cities);
		}

		return () => {
			console.log("[CitiesDataLoader] Component unmounted");
		};
	}, [isSuccess, cities, storage]);

	return <>{children}</>;
}
