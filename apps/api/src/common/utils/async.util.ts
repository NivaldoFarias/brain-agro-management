/**
 * Delays execution for a specified duration.
 *
 * @param ms Milliseconds to delay
 *
 * @returns Promise that resolves after the specified delay
 *
 * @example
 * ```typescript
 * // Rate limit API calls
 * for (const request of requests) {
 *   await processRequest(request);
 *   await delay(100); // Wait 100ms between requests
 * }
 * ```
 */
export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
