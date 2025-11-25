import { faker } from "@faker-js/faker/locale/pt_BR";

import type { SetRequired } from "type-fest";

import type { CitiesService } from "@/modules/cities/cities.service";
import type { CreateFarmDto } from "@/modules/farms/dto";

import { BrazilianState } from "@/common/enums/enums";

enum FarmSize {
	SMALL = "small",
	MEDIUM = "medium",
	LARGE = "large",
}

/**
 * Farm test data fixtures using Faker.
 *
 * Provides realistic, randomized mock data for testing farm-related
 * functionality. Uses Faker to generate dynamic data while maintaining
 * valid area constraints and Brazilian geography.
 *
 * When CitiesService is provided, it will use real IBGE city data to ensure
 * accurate city-state combinations. Otherwise, falls back to faker-generated
 * city names.
 *
 * @example
 * ```typescript
 * const farm = await farmFixtures.valid(producerId, citiesService);
 * const largeFarm = await farmFixtures.large(producerId);
 * ```
 */
export const farmFixtures = {
	/**
	 * Valid farm with all required fields and realistic data.
	 *
	 * @param producerId Producer UUID to associate with farm
	 * @param citiesService Optional CitiesService for accurate city-state data
	 *
	 * @returns Valid farm creation data
	 */
	async valid(producerId: string, citiesService?: CitiesService): Promise<CreateFarmDto> {
		const { totalArea, arableArea, vegetationArea } = generateAreas();
		const state = faker.helpers.arrayElement(Object.values(BrazilianState));
		const cityData = citiesService ? await citiesService.findRandomByState(state) : null;
		const city = cityData?.name ?? faker.location.city();

		return {
			name: `Fazenda ${city}`,
			city,
			state,
			totalArea,
			arableArea,
			vegetationArea,
			producerId,
		};
	},

	async fillRemainingData(
		data: SetRequired<Partial<CreateFarmDto>, "producerId">,
		citiesService?: CitiesService,
	): Promise<CreateFarmDto> {
		const { totalArea, arableArea, vegetationArea } = generateAreas(FarmSize.MEDIUM, {
			totalArea: data.totalArea,
			arableArea: data.arableArea,
			vegetationArea: data.vegetationArea,
		});

		const state = data.state ?? faker.helpers.arrayElement(Object.values(BrazilianState));
		let city = data.city;

		if (!city && citiesService) {
			const cityData = await citiesService.findRandomByState(state);
			city = cityData?.name;
		}

		city = city ?? faker.location.city();

		return {
			name: data.name ?? `Fazenda ${city}`,
			city,
			state,
			totalArea,
			arableArea,
			vegetationArea,
			producerId: data.producerId,
		};
	},

	/**
	 * Small farm (under 100 hectares).
	 *
	 * @param producerId Producer UUID
	 * @param citiesService Optional CitiesService for accurate city-state data
	 *
	 * @returns Small farm data
	 */
	async small(producerId: string, citiesService?: CitiesService): Promise<CreateFarmDto> {
		const { totalArea, arableArea, vegetationArea } = generateAreas(FarmSize.SMALL);
		const state = faker.helpers.arrayElement(Object.values(BrazilianState));
		const cityData = citiesService ? await citiesService.findRandomByState(state) : null;
		const city = cityData?.name ?? faker.location.city();

		return {
			name: `Fazenda ${city}`,
			city,
			state,
			totalArea,
			arableArea,
			vegetationArea,
			producerId,
		};
	},

	/**
	 * Large farm (over 500 hectares).
	 *
	 * @param producerId Producer UUID
	 * @param citiesService Optional CitiesService for accurate city-state data
	 *
	 * @returns Large farm data
	 */
	async large(producerId: string, citiesService?: CitiesService): Promise<CreateFarmDto> {
		const { totalArea, arableArea, vegetationArea } = generateAreas(FarmSize.LARGE);
		const state = faker.helpers.arrayElement(Object.values(BrazilianState));
		const cityData = citiesService ? await citiesService.findRandomByState(state) : null;
		const city = cityData?.name ?? faker.location.city();

		return {
			name: `Fazenda ${city}`,
			city,
			state,
			totalArea,
			arableArea,
			vegetationArea,
			producerId,
		};
	},

	/**
	 * Farm in specific state.
	 *
	 * @param producerId Producer UUID
	 * @param state Brazilian state
	 * @param citiesService Optional CitiesService for accurate city-state data
	 * @param name Optional custom farm name
	 *
	 * @returns Farm data for specified state
	 */
	async inState(
		producerId: string,
		state: BrazilianState,
		name?: string,
		citiesService?: CitiesService,
	): Promise<CreateFarmDto> {
		const { totalArea, arableArea, vegetationArea } = generateAreas();
		const cityData = citiesService ? await citiesService.findRandomByState(state) : null;
		const city = cityData?.name ?? faker.location.city();

		return {
			name: name ?? `Fazenda ${city}`,
			city,
			state,
			totalArea,
			arableArea,
			vegetationArea,
			producerId,
		};
	},

	/**
	 * Farm with custom name.
	 *
	 * @param producerId Producer UUID
	 * @param name Custom farm name
	 * @param citiesService Optional CitiesService for accurate city-state data
	 *
	 * @returns Farm data with specified name
	 */
	async withName(
		producerId: string,
		name: string,
		citiesService?: CitiesService,
	): Promise<CreateFarmDto> {
		const { totalArea, arableArea, vegetationArea } = generateAreas();
		const state = faker.helpers.arrayElement(Object.values(BrazilianState));
		const cityData = citiesService ? await citiesService.findRandomByState(state) : null;
		const city = cityData?.name ?? faker.location.city();

		return {
			name,
			city,
			state,
			totalArea,
			arableArea,
			vegetationArea,
			producerId,
		};
	},

	/**
	 * Farm with invalid area constraints (arable + vegetation > total).
	 *
	 * Violates business rule: arableArea + vegetationArea must be ≤ totalArea.
	 *
	 * @param producerId - Producer UUID
	 * @returns Invalid farm data for validation testing
	 */
	invalidAreaConstraints(producerId: string): CreateFarmDto {
		const totalArea = 100;

		return {
			name: faker.company.name(),
			city: faker.location.city(),
			state: faker.helpers.arrayElement(Object.values(BrazilianState)),
			totalArea,
			arableArea: 80,
			vegetationArea: 30, // 80 + 30 = 110 > 100 (invalid)
			producerId,
		};
	},

	/**
	 * Farm with negative area values.
	 *
	 * @param producerId - Producer UUID
	 * @returns Invalid farm data for validation testing
	 */
	negativeAreas(producerId: string): CreateFarmDto {
		return {
			name: faker.company.name(),
			city: faker.location.city(),
			state: faker.helpers.arrayElement(Object.values(BrazilianState)),
			totalArea: -100,
			arableArea: -50,
			vegetationArea: -30,
			producerId,
		};
	},

	/**
	 * Farm with non-existent producer ID.
	 *
	 * @returns Farm data with invalid producer reference
	 */
	withNonExistentProducer(): CreateFarmDto {
		const { totalArea, arableArea, vegetationArea } = generateAreas();

		return {
			name: faker.company.name(),
			city: faker.location.city(),
			state: faker.helpers.arrayElement(Object.values(BrazilianState)),
			totalArea,
			arableArea,
			vegetationArea,
			producerId: "550e8400-e29b-41d4-a716-446655440000", // Non-existent UUID
		};
	},

	/**
	 * Incomplete farm data missing required fields.
	 *
	 * @returns Partial farm data for validation testing
	 */
	incomplete(): Partial<CreateFarmDto> {
		return {
			name: faker.company.name(),
			// Missing required fields: city, state, areas, producerId
		};
	},
};

function generateAreas(
	size: FarmSize = FarmSize.MEDIUM,
	defaults?: {
		totalArea?: number;
		arableArea?: number;
		vegetationArea?: number;
	},
): Pick<CreateFarmDto, "totalArea" | "arableArea" | "vegetationArea"> {
	const areaRanges = {
		[FarmSize.SMALL]: {
			min: faker.number.int({ min: 1, max: 49 }),
			max: faker.number.int({ min: 50, max: 99 }),
		},
		[FarmSize.MEDIUM]: {
			min: faker.number.int({ min: 100, max: 199 }),
			max: faker.number.int({ min: 200, max: 499 }),
		},
		[FarmSize.LARGE]: {
			min: faker.number.int({ min: 500, max: 999 }),
			max: faker.number.int({ min: 1000, max: 5000 }),
		},
	};

	const range = areaRanges[size];

	const totalArea =
		defaults?.totalArea ??
		faker.number.float({
			min: faker.number.int({ min: range.min, max: range.max }),
			max: faker.number.int({ min: range.min, max: range.max }),
			fractionDigits: 2,
		});

	const minArableArea = faker.number.float({ min: 0.4, max: 0.7 });
	const maxArableArea = faker.number.float({ min: minArableArea, max: 0.9 });

	const arableArea =
		defaults?.arableArea ??
		faker.number.float({
			min: totalArea * minArableArea,
			max: totalArea * maxArableArea,
			fractionDigits: 2,
		});

	const vegetationArea = defaults?.vegetationArea ?? Number((totalArea - arableArea).toFixed(2));

	return { totalArea, arableArea, vegetationArea };
}
