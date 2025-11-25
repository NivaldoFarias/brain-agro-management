import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";
import { PinoLogger } from "nestjs-pino";
import { Repository } from "typeorm";

import { City } from "@/modules/cities/entities/city.entity";

/**
 * Validates that a city exists within the specified Brazilian state
 *
 * This constraint queries the cities table (populated from IBGE data) to verify
 * that the provided city name exists in the given state. The validation is
 * case-insensitive and relies on the `state` property being present in the DTO.
 *
 * @example
 * ```typescript
 * class CreateFarmDto {
 *   @IsCityInState()
 *   city: string;
 *
 *   @IsEnum(BrazilianState)
 *   state: BrazilianState;
 * }
 * ```
 */
@ValidatorConstraint({ name: "IsCityInState", async: true })
@Injectable()
export class IsCityInStateConstraint implements ValidatorConstraintInterface {
	constructor(
		@InjectRepository(City)
		private readonly cityRepository: Repository<City>,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(IsCityInStateConstraint.name);
	}

	/**
	 * Validates city exists in the specified state
	 *
	 * Performs case-insensitive lookup in the cities table populated from IBGE data.
	 * Fails gracefully if database query encounters errors, logging the issue for
	 * monitoring and debugging.
	 *
	 * @param city City name to validate
	 * @param args Validation arguments containing the DTO object
	 *
	 * @returns `true` if city exists in state, `false` otherwise
	 */
	async validate(city: string, args: ValidationArguments): Promise<boolean> {
		if (!city) return false;

		const dto = args.object as { state?: string };
		const state = dto.state;

		if (!state) {
			return false;
		}

		try {
			const cityExists = await this.cityRepository
				.createQueryBuilder("city")
				.where("LOWER(city.name) = LOWER(:name)", { name: city })
				.andWhere("city.state = :state", { state })
				.getExists();

			return cityExists;
		} catch (error) {
			this.logger.error({ err: error, city, state }, "Failed to validate city-state combination");
			return false;
		}
	}

	/**
	 * Returns validation error message
	 *
	 * @param args Validation arguments containing the DTO object and value
	 *
	 * @returns Error message string
	 */
	defaultMessage(args: ValidationArguments): string {
		const dto = args.object as { state?: string };
		const city = args.value as string;
		const state = dto.state;

		if (!state) {
			return "State must be provided to validate city";
		}

		return `City '${city}' does not exist in state '${state}'`;
	}
}

/**
 * Decorator that validates city exists within the specified state
 *
 * Uses IBGE-sourced city data to ensure the city-state combination is valid.
 * Requires a `state` property to be present in the same DTO.
 *
 * @param validationOptions Optional class-validator options
 *
 * @returns PropertyDecorator
 *
 * @example
 * ```typescript
 * class CreateFarmDto {
 *   @IsCityInState({ message: 'Invalid city for the selected state' })
 *   city: string;
 *
 *   @IsEnum(BrazilianState)
 *   state: BrazilianState;
 * }
 * ```
 */
export function IsCityInState(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsCityInStateConstraint,
		});
	};
}
