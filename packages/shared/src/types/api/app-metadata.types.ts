/** API Application Metadata */
export interface ApiAppMetadata {
	/** Application information */
	name: string;

	/** Application version */
	version: string;

	/** Application description */
	description: string;

	/** API endpoints */
	endpoints: {
		/** API Documentation endpoint */
		documentation: string;

		/** API Reference endpoint */
		reference: string;

		/** Health check endpoint */
		health: string;

		/** Readiness check endpoint */
		healthReady: string;

		/** Producers endpoint */
		producers: string;

		/** Farms endpoint */
		farms: string;

		/** Authentication endpoints */
		auth: {
			/** Login endpoint */
			login: string;

			/** Logout endpoint */
			logout: string;
		};

		/** Statistics endpoints */
		statistics: {
			/** Total area statistics endpoint */
			totalArea: string;

			/** Land use statistics endpoint */
			landUse: string;

			/** Statistics by state endpoint */
			byState: string;

			/** Crops distribution statistics endpoint */
			cropsDistribution: string;
		};
	};
}
