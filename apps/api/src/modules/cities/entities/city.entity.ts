import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { BrazilianState } from "@/common/enums/enums";

/**
 * City entity representing Brazilian municipalities
 *
 * Stores city names and their corresponding states for validation purposes.
 * Data is seeded from IBGE (Instituto Brasileiro de Geografia e Estatística)
 * API during migrations to ensure accuracy.
 *
 * @example
 * ```typescript
 * const city = new City();
 * city.name = "Campinas";
 * city.state = BrazilianState.SP;
 * city.ibgeCode = "3509502";
 * ```
 */
@Entity("cities")
export class City {
	/**
	 * Unique identifier (UUID v4)
	 */
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	/**
	 * Municipality name as registered in IBGE
	 *
	 * @example "São Paulo"
	 */
	@Column({ type: "varchar", length: 255, nullable: false })
	name!: string;

	/**
	 * Brazilian state (UF) where the city is located
	 *
	 * @example "SP"
	 */
	@Column({ type: "varchar", length: 2, nullable: false })
	state!: string;

	/**
	 * IBGE municipality code (7 digits)
	 *
	 * Unique identifier from Brazilian Institute of Geography and Statistics.
	 *
	 * @example "3509502" // (São Paulo city code)
	 */
	@Column({ type: "varchar", length: 7, nullable: false, unique: true })
	ibgeCode!: string;

	/**
	 * Record creation timestamp
	 */
	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	/**
	 * Record last update timestamp
	 */
	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}
