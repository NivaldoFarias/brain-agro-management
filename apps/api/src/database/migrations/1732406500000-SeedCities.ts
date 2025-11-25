import { faker } from "@faker-js/faker";

import type { MigrationInterface, QueryRunner } from "typeorm";

import { BrazilianState } from "@/common";

/**
 * IBGE city data response interface
 *
 * Represents the structure of city data returned by IBGE API.
 */
interface IBGECity {
	"id": number;
	"nome": string;
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
 * Seeds Brazilian cities from IBGE API
 *
 * Fetches all Brazilian municipalities from the official IBGE API and inserts
 * them into the cities table. This ensures accurate, up-to-date city data for
 * validation purposes.
 *
 * The migration fetches data for each state individually to avoid API rate
 * limiting and handles errors gracefully.
 *
 * @see {@link https://servicodados.ibge.gov.br/api/docs/localidades} IBGE API Documentation
 */
export class SeedCities1732406500000 implements MigrationInterface {
	name = "SeedCities1732406500000";

	/**
	 * Brazilian state codes for IBGE API queries
	 */
	private readonly states = Object.values(BrazilianState);
	/**
	 * Creates cities table and seeds with IBGE data
	 *
	 * @param queryRunner - TypeORM query runner for executing SQL
	 */
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Create cities table
		await queryRunner.query(`
            CREATE TABLE "cities" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar(255) NOT NULL,
                "state" varchar(2) NOT NULL,
                "ibge_code" varchar(7) NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "UQ_cities_ibge_code" UNIQUE ("ibge_code")
            )
        `);

		// Create indexes for efficient lookups
		await queryRunner.query(`CREATE INDEX "IDX_cities_state" ON "cities" ("state")`);

		await queryRunner.query(`CREATE INDEX "IDX_cities_name_state" ON "cities" ("name", "state")`);

		// Fetch and insert city data from IBGE API
		console.log("Fetching Brazilian cities from IBGE API...");

		for (const state of this.states) {
			try {
				const cities = await this.fetchCitiesForState(state);

				await this.insertCities(queryRunner, cities, state);

				console.log(`✓ Seeded ${cities.length} cities for ${state}`);

				await this.delay(100);
			} catch (error) {
				console.error(`✗ Failed to seed cities for ${state}:`, error);
			}
		}

		console.log("City seeding completed!");
	}

	/**
	 * Fetches cities for a specific state from IBGE API
	 *
	 * @param state Brazilian state code (UF)
	 *
	 * @returns Array of IBGE city objects
	 */
	private async fetchCitiesForState(state: string): Promise<IBGECity[]> {
		const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`IBGE API returned status ${response.status} for state ${state}`);
		}

		return (await response.json()) as IBGECity[];
	}

	/**
	 * Inserts cities into the database
	 *
	 * @param queryRunner TypeORM query runner
	 * @param cities Array of IBGE city objects
	 * @param state Brazilian state code (UF)
	 */
	private async insertCities(
		queryRunner: QueryRunner,
		cities: IBGECity[],
		state: string,
	): Promise<void> {
		if (cities.length === 0) return;

		// Build bulk insert query
		const values = cities
			.map((city) => {
				const id = faker.string.uuid();
				const name = city.nome.replace(/'/g, "''"); // Escape single quotes
				const ibgeCode = city.id.toString();
				const now = new Date().toISOString();

				return `('${id}', '${name}', '${state}', '${ibgeCode}', '${now}', '${now}')`;
			})
			.join(", ");

		await queryRunner.query(`
            INSERT INTO "cities" ("id", "name", "state", "ibge_code", "created_at", "updated_at")
            VALUES ${values}
        `);
	}

	/**
	 * Delays execution for specified milliseconds
	 *
	 * @param ms Milliseconds to delay
	 *
	 * @returns Promise that resolves after delay
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Drops the cities table
	 *
	 * @param queryRunner TypeORM query runner for executing SQL
	 */
	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_cities_name_state"`);
		await queryRunner.query(`DROP INDEX "IDX_cities_state"`);
		await queryRunner.query(`DROP TABLE "cities"`);
	}
}
