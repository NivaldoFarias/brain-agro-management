/**
 * @fileoverview Database seeding constants
 *
 * Contains configuration values and type definitions specific to the database
 * seeding process, including state weights, crop combinations, and scale configurations.
 */

import { BrazilianState, CropType, SupportedLocale } from "@agro/shared/enums";

/** Supported database seeding scales */
export enum SeedScale {
	Small = "small",
	Medium = "medium",
	Large = "large",
}

export const FARM_NAME_PREFIXES = {
	[SupportedLocale.Portuguese]: ["Fazenda", "Sítio", "Chácara", "Rancho", "Estância"],
	[SupportedLocale.English]: ["Farm", "Ranch", "Estate", "Homestead", "Plantation"],
};

/**
 * Seed configuration interface
 *
 * Defines the number of entities to create during database seeding.
 */
export interface SeedConfig {
	/** Number of producers to create */
	producers: number;

	/** Number of farms to create */
	farms: number;

	/** Number of harvest years to generate */
	harvestYears: number;
}

/**
 * IBGE city data response interface
 *
 * Represents the structure of city data returned by IBGE API.
 */
export interface CityMetadataIbge {
	/** IBGE city ID */
	"id": number;

	/** City name */
	"nome": string;

	/** Microregion information (deprecated structure) */
	"microrregiao"?: {
		id: number;
		nome: string;
		mesorregiao?: {
			id: number;
			nome: string;
			UF?: {
				id: number;
				sigla: string;
				nome: string;
				regiao: {
					id: number;
					sigla: string;
					nome: string;
				};
			};
		};
	};

	/** Immediate region information (current structure) */
	"regiao-imediata": {
		"id": number;
		"nome": string;
		"regiao-intermediaria": {
			id: number;
			nome: string;
			UF: {
				id: number;
				sigla: string;
				nome: string;
				regiao: {
					id: number;
					sigla: string;
					nome: string;
				};
			};
		};
	};
}

/**
 * Brazilian states distribution weights for realistic farm locations.
 *
 * Based on agricultural importance in Brazil. Weights sum to approximately 1.0.
 */
export const STATE_WEIGHTS: Record<BrazilianState, number> = {
	[BrazilianState.MT]: 0.15,
	[BrazilianState.PR]: 0.12,
	[BrazilianState.RS]: 0.12,
	[BrazilianState.GO]: 0.1,
	[BrazilianState.MS]: 0.08,
	[BrazilianState.SP]: 0.08,
	[BrazilianState.MG]: 0.07,
	[BrazilianState.BA]: 0.06,
	[BrazilianState.SC]: 0.05,
	[BrazilianState.MA]: 0.04,
	[BrazilianState.TO]: 0.03,
	[BrazilianState.PI]: 0.03,
	[BrazilianState.PA]: 0.02,
	[BrazilianState.RO]: 0.02,
	[BrazilianState.CE]: 0.01,
	[BrazilianState.PE]: 0.01,
	[BrazilianState.SE]: 0.005,
	[BrazilianState.AL]: 0.005,
	[BrazilianState.RN]: 0.005,
	[BrazilianState.PB]: 0.005,
	[BrazilianState.ES]: 0.005,
	[BrazilianState.RJ]: 0.005,
	[BrazilianState.DF]: 0.003,
	[BrazilianState.AM]: 0.002,
	[BrazilianState.AC]: 0.001,
	[BrazilianState.RR]: 0.001,
	[BrazilianState.AP]: 0.001,
};

/**
 * Crop combinations that commonly appear together in Brazilian farms.
 *
 * Represents realistic planting patterns:
 * - Single crops (monoculture)
 * - Crop rotation pairs (soybean/corn)
 * - Multi-crop systems
 */
export const CROP_COMBINATIONS: Array<Array<CropType>> = [
	[CropType.Soy, CropType.Corn],
	[CropType.Soy],
	[CropType.Corn],
	[CropType.Cotton, CropType.Soy],
	[CropType.Coffee],
	[CropType.Sugarcane],
	[CropType.Soy, CropType.Corn, CropType.Cotton],
];
