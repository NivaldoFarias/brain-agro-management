/**
 * Test fixtures and mock data factories.
 *
 * Centralized exports for all test fixtures using Faker for realistic,
 * randomized data generation. Organized by entity type for better
 * maintainability and adherence to the DRY principle.
 *
 * @example
 * ```typescript
 * import { fixtures, TestConstants } from './fixtures';
 *
 * const producer = fixtures.producer.validCPF();
 * const farm = fixtures.farm.valid(producer.id);
 * const notFoundId = TestConstants.NON_EXISTENT_UUID;
 * ```
 */

export * from "./constants";
export * from "./farm.fixtures";
export * from "./producer.fixtures";
