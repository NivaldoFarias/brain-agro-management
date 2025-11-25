import type { Server } from "node:http";

import { FarmsScenario } from "./farms.scenario";
import { ProducersScenario } from "./producers.scenario";

/**
 * Test scenarios container.
 *
 * Holds all initialized scenario builders for type-safe access without
 * null checks. All scenarios are guaranteed to be defined after creation.
 */
export interface TestScenarios {
	farms: FarmsScenario;
	producers: ProducersScenario;
}

/**
 * Creates and initializes all test scenario builders.
 *
 * This factory function ensures all scenarios are properly initialized
 * and type-safe, eliminating the need for null checks throughout tests.
 *
 * @param server HTTP server instance from the NestJS application
 *
 * @returns Initialized scenarios object with all builders ready to use
 *
 * @example
 * ```typescript
 * let scenarios: TestScenarios;
 *
 * beforeAll(async () => {
 *   const { app, server } = await createTestApp();
 *   scenarios = createTestScenarios(server);
 * });
 *
 * it('should create a farm', async () => {
 *   // No null checks needed!
 *   const response = await scenarios.farms.create(farmData);
 * });
 * ```
 */
export function createTestScenarios(server: Server): TestScenarios {
	return {
		farms: new FarmsScenario(server),
		producers: new ProducersScenario(server),
	};
}
