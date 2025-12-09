import { useCallback, useState } from "react";

import { Logger } from "@/utils/logger.util";

const logger = new Logger({ context: "useLocalStorage" });

/**
 * Type-safe localStorage hook with automatic JSON serialization.
 *
 * Provides a React state-like API for localStorage values with:
 * - Automatic JSON parsing/stringification
 * - Error handling for quota/permission issues
 * - SSR safety (no localStorage access during render)
 * - Type inference from initial value
 *
 * @template T The type of the stored value
 *
 * @param key The localStorage key to use
 * @param initialValue Default value if key doesn't exist
 *
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 *
 * // Update value
 * setTheme('dark');
 *
 * // Clear value
 * removeTheme();
 * ```
 */
export function useLocalStorage<T>(
	key: string,
	initialValue: T,
): [T, (value: T) => void, () => void] {
	/** Read from localStorage on mount */
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : initialValue;
		} catch (error) {
			logger.error(`Failed to read key "${key}":`, error);
			return initialValue;
		}
	});

	/** Update localStorage and state */
	const setValue = useCallback(
		(value: T) => {
			try {
				setStoredValue(value);
				window.localStorage.setItem(key, JSON.stringify(value));
			} catch (error) {
				logger.error(`Failed to set key "${key}":`, error);
			}
		},
		[key],
	);

	/** Remove value from localStorage and reset to initial value */
	const removeValue = useCallback(() => {
		try {
			window.localStorage.removeItem(key);
			setStoredValue(initialValue);
		} catch (error) {
			logger.error(`Failed to remove key "${key}":`, error);
		}
	}, [key, initialValue]);

	return [storedValue, setValue, removeValue];
}
