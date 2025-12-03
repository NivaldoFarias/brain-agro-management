import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { FarmHarvest } from "./farm-harvest.entity";

/**
 * Harvest entity representing agricultural seasons/cycles
 *
 * A harvest represents a specific planting and cultivation cycle (e.g., "2024/2025").
 * Multiple farms can participate in the same harvest, growing different crops.
 *
 * Business Rules:
 * - Year must be valid (e.g., "2024" or "2024/2025")
 * - Each harvest can have multiple farms with different crops
 *
 * @see {@link FarmHarvest} for farm-harvest-crop relationships
 */
@Entity("harvests")
export class Harvest {
	/** Unique identifier (UUID v4) */
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	/**
	 * Harvest year or season identifier
	 *
	 * Examples: "2024", "2024/2025", "2025"
	 */
	@Column({ type: "varchar", length: 20, unique: true })
	year!: string;

	/** Optional description of the harvest season */
	@Column({ type: "text", nullable: true })
	description?: string;

	/**
	 * Farm-harvest relationships with crop information
	 *
	 * Represents which farms participated in this harvest and what crops were planted.
	 */
	@OneToMany(() => FarmHarvest, (farmHarvest) => farmHarvest.harvest)
	farmHarvests!: Array<FarmHarvest>;

	/** Timestamp of record creation */
	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	/** Timestamp of last record update */
	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}
