/**
 * JWT token payload structure.
 *
 * Defines the standard claims included in JWT tokens for authentication.
 */
export interface JwtPayload {
	/** User ID (subject claim) */
	sub: string;

	/** User email address */
	email: string;

	/** Token issued at timestamp (added automatically by JWT library) */
	iat?: number;

	/** Token expiration timestamp (added automatically by JWT library) */
	exp?: number;
}
