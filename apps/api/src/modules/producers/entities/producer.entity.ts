import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

import { Farm } from "@/modules/farms/entities/";

/**
 * Producer entity representing a rural producer in the agricultural management system
 *
 * A producer can own multiple farms (0..N relationship) and is identified by either
 * CPF (individual) or CNPJ (legal entity). The document number is validated according
 * to Brazilian standards before persistence.
 *
 * Business Rules:
 * - CPF must be valid (11 digits with verification algorithm)
 * - CNPJ must be valid (14 digits with verification algorithm)
 * - Document number must be unique across all producers
 * - Name is required and cannot be empty
 *
 * @see {@link Farm} for farm relationship details
 */
@Entity("producers")
export class Producer {
	/** Unique identifier (UUID v4) */
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	/**
	 * Producer's CPF (individual) or CNPJ (legal entity)
	 *
	 * Must be validated before persistence:
	 * - CPF: 11 digits (e.g., "12345678900")
	 * - CNPJ: 14 digits (e.g., "12345678000190")
	 *
	 * Stored without formatting (digits only).
	 */
	@Column({ type: "varchar", length: 14, unique: true })
	document!: string;

	/** Producer's full name or company name */
	@Column({ type: "varchar", length: 255 })
	name!: string;

	/**
	 * Farms owned by this producer
	 *
	 * Uses eager loading to avoid N+1 queries. Load explicitly when needed:
	 * ```typescript
	 * const producer = await producerRepository.findOne({
	 *   where: { id },
	 *   relations: ['farms']
	 * });
	 * ```
	 */
	@OneToMany(() => Farm, (farm) => farm.producer)
	farms!: Array<Farm>;

	/** Timestamp of record creation */
	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	/** Timestamp of last record update */
	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}
