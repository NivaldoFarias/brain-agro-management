import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { Repository } from "typeorm";

import type { JwtPayload } from "./interfaces/jwt-payload.interface";

import { User } from "./entities/user.entity";

/**
 * Authentication service for JWT token generation and validation.
 *
 * Provides methods to create access tokens for authenticated users.
 */
@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	) {}

	/**
	 * Validates user credentials against database.
	 *
	 * Queries the user by email, verifies the bcrypt-hashed password,
	 * and checks if the account is active.
	 *
	 * @param email The user's email address
	 * @param password The user's plaintext password
	 *
	 * @returns The user object if credentials are valid, `null` otherwise
	 *
	 * @example
	 * ```typescript
	 * const user = await this.authService.validateCredentials('user@example.com', 'password123');
	 * if (user) {
	 *   console.log('Authentication successful');
	 * }
	 * ```
	 */
	async validateCredentials(email: string, password: string): Promise<User | null> {
		const user = await this.userRepository.findOne({
			where: { email },
			select: ["id", "email", "name", "password", "isActive"],
		});

		if (!user || !user.isActive) return null;

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) return null;

		return user;
	}

	/**
	 * Hashes a plaintext password using bcrypt.
	 *
	 * @param password The plaintext password to hash
	 *
	 * @returns The bcrypt-hashed password
	 *
	 * @example
	 * ```typescript
	 * const hashedPassword = await this.authService.hashPassword('mySecurePassword');
	 * ```
	 */
	async hashPassword(password: string): Promise<string> {
		const saltRounds = 10;
		return bcrypt.hash(password, saltRounds);
	}

	/**
	 * Generates a JWT access token for the given user.
	 *
	 * @param userId The unique identifier of the user
	 * @param email The user's email address
	 *
	 * @returns An object containing the JWT access token
	 *
	 * @example
	 * ```typescript
	 * const token = this.authService.generateToken('user-uuid', 'user@example.com');
	 * console.log(token);
	 * // ^? { accessToken: 'eyJhbGc...' }
	 * ```
	 */
	generateToken(userId: string, email: string): { accessToken: string } {
		const payload: JwtPayload = { sub: userId, email };
		const accessToken = this.jwtService.sign(payload);

		return { accessToken };
	}

	/**
	 * Validates and decodes a JWT token.
	 *
	 * @param token The JWT token to validate
	 *
	 * @returns The decoded JWT payload if valid, null otherwise
	 *
	 * @example
	 * ```typescript
	 * const payload = await this.authService.validateToken(token);
	 * if (payload) {
	 *   console.log(payload.sub); // user id
	 * }
	 * ```
	 */
	validateToken(token: string): JwtPayload | null {
		try {
			return this.jwtService.verify<JwtPayload>(token);
		} catch {
			return null;
		}
	}
}
