import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * JWT authentication guard for protecting routes.
 *
 * Validates JWT tokens from the Authorization header and attaches
 * user information to the request. Routes marked with `@Public()`
 * decorator bypass authentication.
 *
 * @example
 * ```typescript
 * // Protect a single route
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req) {
 *   return req.user;
 * }
 *
 * // Or apply globally in main.ts
 * app.useGlobalGuards(new JwtAuthGuard(reflector));
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private reflector: Reflector) {
		super();
	}

	/**
	 * Determines if authentication should be applied to the current request.
	 *
	 * @param context The execution context containing request metadata
	 *
	 * @returns `true` if the route can be accessed, `false` otherwise
	 */
	canActivate(context: ExecutionContext): ReturnType<typeof AuthGuard.prototype.canActivate> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}
}
