import { SetMetadata } from "@nestjs/common";

import type { CustomDecorator } from "@nestjs/common";

/**
 * Metadata key for marking routes as public (bypassing authentication).
 */
export const IS_PUBLIC_KEY = "isPublic";

/**
 * Decorator to mark routes as public, bypassing JWT authentication.
 *
 * Use this decorator on controller methods or classes that should be
 * accessible without authentication tokens.
 *
 * @example
 * ```typescript
 * @Public()
 * @Post('login')
 * async login(@Body() loginDto: LoginDto) {
 *   return this.authService.login(loginDto);
 * }
 *
 * @Public()
 * @Get('health')
 * checkHealth() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
