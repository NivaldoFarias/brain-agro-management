import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import type { AuthResponseDto } from "./dto/auth-response.dto";

import { Public } from "@/common/decorators/public.decorator";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

/**
 * Controller handling authentication endpoints.
 *
 * Provides login functionality and token generation for API access.
 */
@Public()
@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Login endpoint that generates a JWT access token.
	 *
	 * @param loginDto User credentials (email and password)
	 *
	 * @returns JWT access token for API authentication
	 *
	 * @example
	 * ```http
	 * POST /api/auth/login
	 * Content-Type: application/json
	 *
	 * {
	 *   "email": "admin@example.com",
	 *   "password": "admin123"
	 * }
	 * ```
	 */
	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Login and receive JWT token" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Successfully authenticated and received token",
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "Invalid credentials",
	})
	login(@Body() loginDto: LoginDto): AuthResponseDto {
		// For this technical assessment, we use a simplified auth flow
		// In production, you would validate credentials against a user database
		const { email } = loginDto;

		// Generate a token with mock user ID
		const token = this.authService.generateToken("demo-user-id", email);

		return token;
	}
}
