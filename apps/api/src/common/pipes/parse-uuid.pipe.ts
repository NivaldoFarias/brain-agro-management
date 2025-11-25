import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import z from "zod";

import type { ArgumentMetadata } from "@nestjs/common";

/**
 * Custom pipe for parsing and validating UUID parameters.
 *
 * Provides better error messages than NestJS's built-in ParseUUIDPipe
 * by including the parameter name and invalid value in the error message.
 *
 * @example
 * ```typescript
 * @Get(':id')
 * async findOne(@Param('id', ParseUUIDPipe) id: string) {
 *   return this.service.findOne(id);
 * }
 * ```
 */
@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
	/**
	 * Validates and transforms UUID string parameters.
	 *
	 * @param value Raw parameter value from request
	 * @param metadata Metadata about the parameter (name, type, etc.)
	 *
	 * @returns Validated UUID string
	 *
	 * @throws BadRequestException if value is not a valid UUID
	 */
	transform(value: string, metadata: ArgumentMetadata): string {
		const fieldName = metadata.data ?? "";

		if (!value) {
			throw new BadRequestException(
				`Validation failed: '${fieldName}' is required and must be a valid UUID`,
			);
		}

		if (!z.uuid().safeParse(value).success) {
			throw new BadRequestException(
				`Validation failed: '${fieldName}' must be a valid UUID (received: '${value}')`,
			);
		}

		return value;
	}
}
