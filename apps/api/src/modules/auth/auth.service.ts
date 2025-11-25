import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import type { JwtPayload } from "./interfaces/jwt-payload.interface";

/**
 * Authentication service for JWT token generation and validation.
 *
 * Provides methods to create access tokens for authenticated users.
 */
@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) {}

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
