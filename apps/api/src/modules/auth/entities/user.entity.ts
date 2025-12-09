import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

/**
 * User entity for authentication and authorization.
 *
 * Stores user credentials with bcrypt-hashed passwords for secure authentication.
 * Used by the authentication system to validate login attempts and manage user sessions.
 */
@Entity("users")
export class User {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", length: 255, unique: true })
	email!: string;

	@Column({ type: "varchar", length: 255 })
	name!: string;

	/**
	 * Bcrypt-hashed password.
	 *
	 * NEVER return this field in API responses. Use `@Exclude()` from class-transformer
	 * or select queries that explicitly exclude this column.
	 */
	@Column({ type: "varchar", length: 255, select: false })
	password!: string;

	@Column({ name: "is_active", type: "boolean", default: true })
	isActive!: boolean;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}
