import type { CitiesByState } from "@agro/shared/types";

/**
 * DTO for cities grouped by Brazilian states.
 *
 * Contains all unique cities organized by state, used for
 * cascading city selection in farm forms.
 *
 * @example
 * ```typescript
 * const response: CitiesByStateDto = {
 *   SP: [
 *     { name: "São Paulo", state: "SP" },
 *     { name: "Campinas", state: "SP" }
 *   ],
 *   MG: [
 *     { name: "Belo Horizonte", state: "MG" }
 *   ]
 * };
 * ```
 */
export type CitiesByStateDto = CitiesByState;
