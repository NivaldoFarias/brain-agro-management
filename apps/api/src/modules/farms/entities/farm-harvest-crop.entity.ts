import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import type { FarmHarvest } from "./farm-harvest.entity";

import { CropType } from "@/common";

/**
 * FarmHarvestCrop entity representing specific crops planted in a farm during a harvest
 *
 * This entity allows a farm to plant multiple different crops during the same harvest
 * season. It connects FarmHarvest with specific crop types.
 *
 * Relationship Chain:
 * - Farm → FarmHarvest → FarmHarvestCrop (contains CropType)
 *
 * Business Rules:
 * - A farm can have multiple crops in the same harvest
 * - Each crop type can only appear once per farm-harvest combination
 *
 * @see {@link FarmHarvest} for farm-harvest relationship
 * @see {@link CropType} for available crop types
 */
@Entity("farm_harvest_crops")
export class FarmHarvestCrop {
	/**
	 * Unique identifier (UUID v4)
	 */
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	/**
	 * ID of the farm-harvest association
	 */
	@Column({ type: "uuid", name: "farm_harvest_id" })
	farmHarvestId!: string;

	/**
	 * Type of crop planted (soy, corn, cotton, coffee, sugarcane)
	 */
	@Column({ type: "varchar", length: 50, enum: CropType, name: "crop_type" })
	cropType!: CropType;

	/**
	 * Farm-harvest association this crop belongs to
	 */
	@ManyToOne("FarmHarvest", "crops", { lazy: true })
	@JoinColumn({ name: "farm_harvest_id" })
	farmHarvest!: Promise<FarmHarvest>;

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
