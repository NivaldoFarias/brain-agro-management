import { faker } from "@faker-js/faker/locale/pt_BR";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object for authentication response.
 *
 * Contains the JWT access token for API authentication.
 */
export class AuthResponseDto {
	@ApiProperty({
		description: "JWT access token for API authentication",
		example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${faker.string.alphanumeric(50)}.${faker.string.alphanumeric(43)}`,
	})
	accessToken!: string;
}
