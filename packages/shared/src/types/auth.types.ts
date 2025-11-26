/**
 * Authentication response data transfer object.
 *
 * Contains the JWT access token returned after successful authentication.
 */
export interface AuthResponseDto {
	/** JWT access token for API authentication */
	accessToken: string;
}

/**
 * Login request payload.
 *
 * Contains user credentials for authentication.
 */
export interface LoginDto {
	/** User email address */
	email: string;

	/** User password */
	password: string;
}
