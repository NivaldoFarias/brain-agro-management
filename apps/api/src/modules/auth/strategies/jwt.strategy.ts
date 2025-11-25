import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { JwtPayload } from "../interfaces/jwt-payload.interface";

import { env } from "@/config/env.config";

/**
 * JWT authentication strategy for Passport.
 *
 * Validates JWT tokens from the Authorization header and extracts
 * user information for protected routes.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: env.API__JWT_SECRET,
		});
	}

	/**
	 * Validates the JWT payload and returns user information.
	 *
	 * This method is called automatically by Passport after token validation.
	 * The returned object is attached to the request as `req.user`.
	 *
	 * @param payload The decoded JWT payload
	 *
	 * @returns User information to be attached to the request
	 *
	 * @example
	 * ```typescript
	 * // After successful validation, the user object is available:
	 * // req.user = { userId: 'uuid', email: 'user@example.com' }
	 * ```
	 */
	validate(payload: JwtPayload): { userId: string; email: string } {
		return { userId: payload.sub, email: payload.email };
	}
}
