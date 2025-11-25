import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { env } from "@/config/env.config";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

/**
 * Auth module providing JWT-based authentication.
 *
 * Configures JWT tokens with HS256 algorithm and passport strategy
 * for protecting routes with bearer token authentication.
 */
@Module({
	imports: [
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.register({
			secret: env.API__JWT_SECRET,
			signOptions: {
				expiresIn: env.API__JWT_EXPIRATION as `${number}${"ms" | "s" | "m" | "h" | "d"}`,
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
