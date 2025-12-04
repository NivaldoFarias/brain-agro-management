import type { BrazilianState } from "../utils/constants.util";

/**
 * Cities grouped by Brazilian state.
 *
 * Maps each state code to its list of cities, used for
 * cascading city selection in forms.
 *
 * @example
 * ```typescript
 * const citiesByState: CitiesByState = {
 *   SP: [
 *     { name: "São Paulo", state: "SP" },
 *     { name: "Campinas", state: "SP" }
 *   ],
 *   MG: [
 *     { name: "Belo Horizonte", state: "MG" },
 *     { name: "Uberlândia", state: "MG" }
 *   ]
 * };
 * ```
 */
export type CitiesByState = Record<BrazilianState, Array<string>>;

/** City entity type for API responses */
export interface CityData {
	/** Unique identifier (UUID) */
	id: string;

	/** Name of the city */
	name: string;

	/** Brazilian state (UF) where the city is located */
	state: string;

	/** IBGE municipality code (7 digits) */
	ibgeCode: string;

	/** Timestamp when the city was created */
	createdAt: string;

	/** Timestamp when the city was last updated */
	updatedAt: string;
}
