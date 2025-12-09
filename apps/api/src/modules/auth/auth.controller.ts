import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UnauthorizedException,
} from "@nestjs/common";
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
@ApiTags("Auth")
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
	 *   "email": "admin@brainag.com",
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
	async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
		const { email, password } = loginDto;

		const user = await this.authService.validateCredentials(email, password);

		if (!user) {
			throw new UnauthorizedException("Invalid email or password");
		}

		const token = this.authService.generateToken(user.id, user.email);

		return token;
	}
}
