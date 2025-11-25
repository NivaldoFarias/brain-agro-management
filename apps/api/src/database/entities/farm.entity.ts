import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import type { FarmHarvest } from "./farm-harvest.entity";
import type { Producer } from "./producer.entity";

import { BrazilianState } from "./enums";

/**
 * Farm entity representing agricultural properties in the system
 *
 * Each farm belongs to one producer and contains area information for cultivation
 * and vegetation. The farm can participate in multiple harvests with different crops.
 *
 * Business Rules:
 * - Total area must be positive
 * - Arable area (agricultável) must be ≥ 0
 * - Vegetation area must be ≥ 0
 * - Arable area + Vegetation area MUST be ≤ Total area
 * - City and state are required for location tracking
 *
 * @see {@link Producer} for producer relationship
 * @see {@link FarmHarvest} for harvest-crop relationships
 */
@Entity("farms")
export class Farm {
	/**
	 * Unique identifier (UUID v4)
	 */
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	/**
	 * Farm name or identification
	 */
	@Column({ type: "varchar", length: 255 })
	name!: string;

	/**
	 * City where the farm is located
	 */
	@Column({ type: "varchar", length: 255 })
	city!: string;

	/**
	 * Brazilian state (UF) where the farm is located
	 */
	@Column({ type: "varchar", length: 2, enum: BrazilianState })
	state!: BrazilianState;

	/**
	 * Total farm area in hectares
	 *
	 * Must be greater than 0 and greater than or equal to the sum of
	 * arableArea + vegetationArea.
	 */
	@Column({ type: "decimal", precision: 10, scale: 2, name: "total_area" })
	totalArea!: number;

	/**
	 * Arable area (área agricultável) in hectares
	 *
	 * Area available for crop cultivation. Must be ≥ 0 and when summed with
	 * vegetationArea, must be ≤ totalArea.
	 */
	@Column({ type: "decimal", precision: 10, scale: 2, name: "arable_area" })
	arableArea!: number;

	/**
	 * Vegetation area (área de vegetação) in hectares
	 *
	 * Protected or preserved vegetation area. Must be ≥ 0 and when summed with
	 * arableArea, must be ≤ totalArea.
	 */
	@Column({ type: "decimal", precision: 10, scale: 2, name: "vegetation_area" })
	vegetationArea!: number;

	/**
	 * ID of the producer who owns this farm
	 */
	@Column({ type: "uuid", name: "producer_id" })
	producerId!: string;

	/**
	 * Producer who owns this farm
	 *
	 * Uses forwardRef to prevent circular dependency issues.
	 * Loaded lazily by default.
	 */
	@ManyToOne("Producer", "farms", { lazy: true })
	@JoinColumn({ name: "producer_id" })
	producer!: Promise<Producer>;

	/**
	 * Harvests associated with this farm
	 *
	 * Represents the many-to-many relationship between farms and harvests
	 * through the FarmHarvest join table.
	 */
	@OneToMany("FarmHarvest", "farm", { lazy: true })
	farmHarvests!: Promise<Array<FarmHarvest>>;

	/**
	 * Timestamp of record creation
	 */
	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	/**
	 * Timestamp of last record update
	 */
	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}
