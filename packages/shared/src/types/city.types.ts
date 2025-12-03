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
