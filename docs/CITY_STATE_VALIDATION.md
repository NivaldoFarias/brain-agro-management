# City-State Validation

This document explains the city-state validation implementation using IBGE data.

## Overview

The system validates that cities exist within their specified Brazilian states using official data from IBGE (Instituto Brasileiro de Geografia e Estatística). This ensures data accuracy and prevents invalid city-state combinations.

## Architecture

### Components

1. **City Entity** (`city.entity.ts`)
   - Stores Brazilian municipalities with their IBGE codes
   - Indexed for efficient lookups by state and city name

2. **Migration** (`1732406500000-SeedCities.ts`)
   - Creates the cities table
   - Fetches data from IBGE API for all 27 Brazilian states
   - Inserts ~5,570 municipalities into the database
   - Runs automatically during application startup

3. **Custom Validator** (`city-state.validator.ts`)
   - Implements async validation using class-validator
   - Queries the cities table to verify city-state combinations
   - Provides meaningful error messages
   - Injectable NestJS service using dependency injection

4. **DTO Integration** (`create-farm.dto.ts`)
   - Uses `@IsCityInState()` decorator
   - Validates city against state before farm creation

## Usage

### Running Migrations

To populate the cities table with IBGE data:

```bash
# From project root
cd apps/api

# Run all pending migrations
bun run migration:run
```

The migration will:

- Create the cities table
- Fetch city data from IBGE API for each state
- Insert all Brazilian municipalities (~5,570 cities)
- Take approximately 5-10 seconds to complete

### Validation in Action

When creating a farm, the city is automatically validated:

```typescript
// Valid request
POST /api/farms
{
  "name": "Fazenda Boa Vista",
  "city": "Campinas",        // ✓ Valid city in SP
  "state": "SP",
  "totalArea": 100,
  "arableArea": 70,
  "vegetationArea": 25,
  "producerId": "uuid"
}

// Invalid request
POST /api/farms
{
  "name": "Fazenda Boa Vista",
  "city": "Campinas",        // ✗ Campinas does not exist in RJ
  "state": "RJ",             // Should be SP
  "totalArea": 100,
  "arableArea": 70,
  "vegetationArea": 25,
  "producerId": "uuid"
}
// Response: 400 Bad Request
// Error: "City 'Campinas' does not exist in state 'RJ'"
```

## Technical Details

### Database Schema

```sql
CREATE TABLE "cities" (
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "state" varchar(2) NOT NULL,
    "ibge_code" varchar(7) NOT NULL UNIQUE,
    "created_at" datetime NOT NULL DEFAULT (datetime('now')),
    "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX "IDX_cities_state" ON "cities" ("state");
CREATE INDEX "IDX_cities_name_state" ON "cities" ("name", "state");
```

### IBGE API

The migration fetches data from:

```
https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios
```

Example response:

```json
[
	{
		"id": 3509502,
		"nome": "Campinas",
		"microrregiao": {
			"mesorregiao": {
				"UF": {
					"sigla": "SP"
				}
			}
		}
	}
]
```

### Validation Flow

1. User submits farm creation request with city and state
2. Class-validator triggers `@IsCityInState()` decorator
3. `IsCityInStateConstraint` queries the cities table
4. Query performs case-insensitive city name matching
5. Returns validation result with descriptive error message if invalid

### Performance Considerations

- **In-memory caching**: City data is stored in SQLite database
- **Indexed lookups**: City-state queries use composite index
- **Async validation**: Does not block other validations
- **Error handling**: Gracefully handles database failures

## Maintenance

### Updating City Data

To refresh city data from IBGE (e.g., after new municipalities are created):

```bash
# Revert the cities migration
bun run migration:revert

# Re-run the migration to fetch fresh data
bun run migration:run
```

### Adding Custom Cities

For testing or special cases, you can manually insert cities:

```typescript
import { BrazilianState, City } from "@/database/entities";

const city = new City();
city.name = "Custom City";
city.state = BrazilianState.SP;
city.ibgeCode = "9999999";
await cityRepository.save(city);
```

## Testing

Run validator tests:

```bash
bun test city-state.validator.spec.ts
```

Test coverage includes:

- Valid city-state combinations
- Invalid city-state combinations
- Missing state handling
- Empty city name handling
- Database error handling
- Case-insensitive matching

## Troubleshooting

### Migration fails with network error

**Cause**: IBGE API may be temporarily unavailable

**Solution**: Retry the migration after a few minutes. The migration logs which states failed and continues with others.

### Validation always returns false

**Possible causes**:

1. Cities table is empty (migration didn't run)
2. Database connection issue
3. City name spelling mismatch

**Solution**:

```bash
# Verify cities table has data
sqlite3 apps/api/data/agro.db "SELECT COUNT(*) FROM cities;"
# Should return ~5570

# Check if specific city exists
sqlite3 apps/api/data/agro.db "SELECT * FROM cities WHERE name = 'Campinas' AND state = 'SP';"
```

### Performance degradation

**Cause**: Missing or dropped indexes on cities table

**Solution**:

```sql
-- Rebuild indexes
CREATE INDEX "IDX_cities_state" ON "cities" ("state");
CREATE INDEX "IDX_cities_name_state" ON "cities" ("name", "state");
```

## API Reference

### `@IsCityInState()` Decorator

Custom class-validator decorator for city-state validation.

**Usage**:

```typescript
class CreateFarmDto {
	@IsCityInState({ message: "Custom error message" })
	city: string;

	@IsEnum(BrazilianState)
	state: BrazilianState;
}
```

**Requirements**:

- Must be used on a property of type `string`
- DTO must have a `state` property with `BrazilianState` enum value
- Requires `IsCityInStateConstraint` to be registered as a provider

### `IsCityInStateConstraint`

Injectable validator constraint service.

**Methods**:

- `validate(city: string, args: ValidationArguments): Promise<boolean>`
  - Validates city exists in state
  - Returns `true` if valid, `false` otherwise
  - Performs case-insensitive matching

- `defaultMessage(args: ValidationArguments): string`
  - Returns formatted error message
  - Includes city name and state in message

## References

- [IBGE API Documentation](https://servicodados.ibge.gov.br/api/docs/localidades)
- [class-validator Custom Validators](https://github.com/typestack/class-validator#custom-validation-classes)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
