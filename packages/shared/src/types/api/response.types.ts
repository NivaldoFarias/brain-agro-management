/** Backend API response wrapper interface */
export interface ApiResponse<T> {
	/** Response data */
	data: T;

	/** Metadata about the response */
	meta: {
		/** ISO timestamp of the response */
		timestamp: string;

		/** Optional correlation ID for tracing requests */
		correlationId?: string;
	};
}
