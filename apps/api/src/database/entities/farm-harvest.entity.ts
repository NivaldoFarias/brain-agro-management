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

import type { FarmHarvestCrop } from "./farm-harvest-crop.entity";
import type { Farm } from "./farm.entity";
import type { Harvest } from "./harvest.entity";

/**
 * FarmHarvest join entity representing a farm's participation in a harvest
 *
 * This is a junction table that connects farms and harvests in a many-to-many
 * relationship. Each record represents a specific farm participating in a specific
 * harvest, and can have multiple crops associated through FarmHarvestCrop.
 *
 * Relationship Chain:
 * - Farm (1) ←→ (N) FarmHarvest (N) ←→ (1) Harvest
 * - FarmHarvest (1) ←→ (N) FarmHarvestCrop (connects to crops)
 *
 * @see {@link Farm} for farm details
 * @see {@link Harvest} for harvest/season details
 * @see {@link FarmHarvestCrop} for crop associations
 */
@Entity("farm_harvests")
export class FarmHarvest {
	/**
	 * Unique identifier (UUID v4)
	 */
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	/**
	 * ID of the farm participating in this harvest
	 */
	@Column({ type: "uuid", name: "farm_id" })
	farmId!: string;

	/**
	 * ID of the harvest season
	 */
	@Column({ type: "uuid", name: "harvest_id" })
	harvestId!: string;

	/**
	 * Farm participating in this harvest
	 */
	@ManyToOne("Farm", "farmHarvests", { lazy: true })
	@JoinColumn({ name: "farm_id" })
	farm!: Promise<Farm>;

	/**
	 * Harvest season this farm is participating in
	 */
	@ManyToOne("Harvest", "farmHarvests", { lazy: true })
	@JoinColumn({ name: "harvest_id" })
	harvest!: Promise<Harvest>;

	/**
	 * Crops planted in this farm during this harvest
	 */
	@OneToMany("FarmHarvestCrop", "farmHarvest", { lazy: true })
	crops!: Promise<Array<FarmHarvestCrop>>;

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
