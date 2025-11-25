import { faker } from "@faker-js/faker/locale/pt_BR";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

/**
 * Data transfer object for user login request.
 *
 * Validates user credentials for authentication.
 */
export class LoginDto {
	@ApiProperty({
		description: "User email address",
		example: faker.internet.email(),
	})
	@IsEmail()
	email!: string;

	@ApiProperty({
		description: "User password (minimum 6 characters)",
		example: faker.internet.password({ memorable: true, length: 10 }),
		minLength: 6,
	})
	@IsString()
	@MinLength(6)
	password!: string;
}
