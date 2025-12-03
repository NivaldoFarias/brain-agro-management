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

import { FarmHarvestCrop } from "./farm-harvest-crop.entity";
import { Farm } from "./farm.entity";
import { Harvest } from "./harvest.entity";

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
	/** Unique identifier (UUID v4)
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
	@ManyToOne(() => Farm, (farm) => farm.farmHarvests)
	@JoinColumn({ name: "farm_id" })
	farm!: Farm;

	/**
	 * Harvest season this farm is participating in
	 */
	@ManyToOne(() => Harvest, (harvest) => harvest.farmHarvests)
	@JoinColumn({ name: "harvest_id" })
	harvest!: Harvest;

	/**
	 * Crops planted in this farm during this harvest
	 */
	@OneToMany(() => FarmHarvestCrop, (farmHarvestCrop) => farmHarvestCrop.farmHarvest)
	crops!: Array<FarmHarvestCrop>;

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
