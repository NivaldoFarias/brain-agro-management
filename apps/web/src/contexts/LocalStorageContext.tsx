import { createContext, useCallback, useContext, useMemo } from "react";

import type { ReactElement, ReactNode } from "react";

import { Logger } from "@/utils/logger.util";

const logger = new Logger({ context: "LocalStorage" });

/**
 * Local storage context value interface.
 *
 * Provides centralized localStorage access with type safety
 * and error handling.
 */
export interface LocalStorageContextValue {
	/** Get a value from localStorage with optional default */
	getItem: <T>(key: string, defaultValue?: T) => T | undefined;

	/** Set a value in localStorage with automatic JSON serialization */
	setItem: (key: string, value: unknown) => void;

	/** Remove a value from localStorage */
	removeItem: (key: string) => void;

	/** Clear all localStorage values (use with caution) */
	clear: () => void;
}

const LocalStorageContext = createContext<LocalStorageContextValue | undefined>(undefined);

/** Props for LocalStorageProvider component */
export interface LocalStorageProviderProps {
	children: ReactNode;
}

/**
 * LocalStorage provider component.
 *
 * Provides centralized localStorage access to the entire application
 * with automatic JSON parsing/stringification and error handling.
 *
 * @example
 * ```tsx
 * <LocalStorageProvider>
 *   <App />
 * </LocalStorageProvider>
 * ```
 */
export function LocalStorageProvider({ children }: LocalStorageProviderProps): ReactElement {
	const getItem = useCallback(<T,>(key: string, defaultValue?: T): T | undefined => {
		try {
			const item = window.localStorage.getItem(key);
			if (item === null) return defaultValue;

			return JSON.parse(item) as T;
		} catch (error) {
			logger.error(`Failed to get item "${key}":`, error);
			return defaultValue;
		}
	}, []);

	const setItem = useCallback((key: string, value: unknown): void => {
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			logger.error(`Failed to set item "${key}":`, error);
		}
	}, []);

	const removeItem = useCallback((key: string): void => {
		try {
			window.localStorage.removeItem(key);
		} catch (error) {
			logger.error(`Failed to remove item "${key}":`, error);
		}
	}, []);

	const clear = useCallback((): void => {
		try {
			window.localStorage.clear();
		} catch (error) {
			logger.error("Failed to clear storage:", error);
		}
	}, []);

	const value = useMemo(
		() => ({
			getItem,
			setItem,
			removeItem,
			clear,
		}),
		[getItem, setItem, removeItem, clear],
	);

	return <LocalStorageContext.Provider value={value}>{children}</LocalStorageContext.Provider>;
}

/**
 * Custom hook to access localStorage context.
 *
 * @throws {Error} If used outside LocalStorageProvider
 *
 * @example
 * ```tsx
 * const { getItem, setItem, removeItem } = useLocalStorageContext();
 *
 * // Store user preferences
 * setItem('theme', 'dark');
 *
 * // Retrieve with default
 * const theme = getItem('theme', 'light');
 * ```
 */
export function useLocalStorageContext(): LocalStorageContextValue {
	const context = useContext(LocalStorageContext);

	if (context === undefined) {
		throw new Error("useLocalStorageContext must be used within LocalStorageProvider");
	}

	return context;
}
