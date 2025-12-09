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

export * from "./base.scenario";
export * from "./farms.scenario";
export * from "./producers.scenario";
export * from "./scenarios.factory";
