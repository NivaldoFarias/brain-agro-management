/**
 * Test fixtures and mock data factories.
 *
 * Centralized exports for all test fixtures using Faker for realistic,
 * randomized data generation. Organized by entity type for better
 * maintainability and adherence to the DRY principle.
 *
 * @example
 * ```typescript
 * import { ProducerFixtures, FarmFixtures, TestConstants } from './fixtures';
 *
 * const producer = ProducerFixtures.validCPF();
 * const farm = FarmFixtures.valid(producer.id);
 * const notFoundId = TestConstants.NON_EXISTENT_UUID;
 * ```
 */

import { farmFixtures } from "./farm.fixtures";
import { producerFixtures } from "./producer.fixtures";

export { TestConstants } from "./constants";

export const fixtures = {
	farm: farmFixtures,
	producer: producerFixtures,
};
