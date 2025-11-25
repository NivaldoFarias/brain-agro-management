/**
 * Type-safe E2E test scenario builders.
 *
 * Provides strongly-typed helpers for API testing, eliminating manual type
 * assertions and reducing boilerplate. Each scenario builder wraps supertest
 * requests with full TypeScript inference based on DTOs.
 *
 * @example
 * ```typescript
 * import { ProducersScenario, FarmsScenario } from './scenarios';
 *
 * const producersScenario = new ProducersScenario(server);
 * const farmsScenario = new FarmsScenario(server);
 *
 * const producer = await producersScenario.create({ name: 'Test', document: '...' });
 * const farm = await farmsScenario.create({ ...farmData, producerId: producer.body.id });
 * ```
 */

export type { BaseScenario, ErrorResponse, TypedResponse } from "./base.scenario";
export { assertSuccessResponse, isErrorResponse } from "./base.scenario";

export type { FarmsByStateDto, LandUseStatsDto, TotalAreaStatsDto } from "./farms.scenario";
export { FarmsScenario } from "./farms.scenario";

export { ProducersScenario } from "./producers.scenario";

export type { TestScenarios } from "./scenarios.factory";
export { createTestScenarios } from "./scenarios.factory";
