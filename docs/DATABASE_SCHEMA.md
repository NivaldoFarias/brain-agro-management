# Database Entity-Relationship Diagram

## Overview

This document describes the database schema for the Brain Agriculture management system, including entities, relationships, and business rules.

## Entity Relationship Diagram

```mermaid
erDiagram
    Producer ||--o{ Farm : "owns (0..N)"
    Farm ||--o{ FarmHarvest : "participates in (0..N)"
    Harvest ||--o{ FarmHarvest : "includes (0..N)"
    FarmHarvest ||--o{ FarmHarvestCrop : "plants (1..N)"

    Producer {
        uuid id PK
        varchar(14) document UK "CPF or CNPJ"
        varchar(255) name
        timestamp created_at
        timestamp updated_at
    }

    Farm {
        uuid id PK
        varchar(255) name
        varchar(255) city
        varchar(2) state "Brazilian UF"
        decimal(10,2) total_area "in hectares"
        decimal(10,2) arable_area "área agricultável"
        decimal(10,2) vegetation_area "área de vegetação"
        uuid producer_id FK
        timestamp created_at
        timestamp updated_at
    }

    Harvest {
        uuid id PK
        varchar(20) year UK "e.g., 2024/2025"
        text description
        timestamp created_at
        timestamp updated_at
    }

    FarmHarvest {
        uuid id PK
        uuid farm_id FK
        uuid harvest_id FK
        timestamp created_at
        timestamp updated_at
    }

    FarmHarvestCrop {
        uuid id PK
        uuid farm_harvest_id FK
        varchar(50) crop_type "Soja, Milho, Algodão, Café, Cana"
        timestamp created_at
        timestamp updated_at
    }
```

## Entity Descriptions

### Producer

Represents a rural producer (individual or legal entity).

**Columns:**

- `id` (UUID, PK): Unique identifier
- `document` (VARCHAR(14), UNIQUE): CPF (11 digits) or CNPJ (14 digits), validated
- `name` (VARCHAR(255)): Producer's full name or company name
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Business Rules:**

- CPF must be valid according to Brazilian verification algorithm
- CNPJ must be valid according to Brazilian verification algorithm
- Document must be unique across all producers
- Name is required

### Farm

Represents an agricultural property owned by a producer.

**Columns:**

- `id` (UUID, PK): Unique identifier
- `name` (VARCHAR(255)): Farm name or identification
- `city` (VARCHAR(255)): City location
- `state` (VARCHAR(2)): Brazilian state code (UF)
- `total_area` (DECIMAL(10,2)): Total farm area in hectares
- `arable_area` (DECIMAL(10,2)): Arable area (área agricultável) in hectares
- `vegetation_area` (DECIMAL(10,2)): Vegetation area in hectares
- `producer_id` (UUID, FK): References Producer
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Business Rules:**

- `total_area` must be > 0
- `arable_area` must be ≥ 0
- `vegetation_area` must be ≥ 0
- **CRITICAL:** `arable_area + vegetation_area ≤ total_area`
- State must be valid Brazilian UF
- Farm must belong to a producer

### Harvest

Represents an agricultural season/cycle (e.g., "2024/2025").

**Columns:**

- `id` (UUID, PK): Unique identifier
- `year` (VARCHAR(20), UNIQUE): Harvest year/season identifier
- `description` (TEXT, NULLABLE): Optional description
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Business Rules:**

- Year must be unique
- Multiple farms can participate in the same harvest

### FarmHarvest (Join Table)

Junction table connecting farms to harvests in a many-to-many relationship.

**Columns:**

- `id` (UUID, PK): Unique identifier
- `farm_id` (UUID, FK): References Farm
- `harvest_id` (UUID, FK): References Harvest
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Business Rules:**

- A farm can participate in multiple harvests
- A harvest can include multiple farms
- Each farm-harvest combination can have multiple crops

### FarmHarvestCrop

Represents specific crops planted in a farm during a harvest.

**Columns:**

- `id` (UUID, PK): Unique identifier
- `farm_harvest_id` (UUID, FK): References FarmHarvest
- `crop_type` (VARCHAR(50)): Crop type enum value
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Crop Types (Enum):**

- Soja
- Milho
- Algodão
- Café
- Cana de Açúcar

**Business Rules:**

- A farm can plant multiple crops in the same harvest
- Each crop type should appear only once per farm-harvest combination

## Indexes

The following indexes improve query performance:

- `Producer.document` (UNIQUE): Fast lookup by CPF/CNPJ
- `Farm.producer_id`: Fast farm lookup by producer
- `FarmHarvest.farm_id`: Farm harvest associations
- `FarmHarvest.harvest_id`: Harvest farm associations
- `FarmHarvestCrop.farm_harvest_id`: Crop lookup by farm-harvest

## Relationships Summary

| Entity      | Relationship | Target Entity   | Cardinality |
| ----------- | ------------ | --------------- | ----------- |
| Producer    | owns         | Farm            | 1:N (0..N)  |
| Farm        | participates | FarmHarvest     | 1:N (0..N)  |
| Harvest     | includes     | FarmHarvest     | 1:N (0..N)  |
| FarmHarvest | plants       | FarmHarvestCrop | 1:N (1..N)  |

## Dashboard Aggregations

The schema supports the following dashboard queries:

1. **Total Farms Count:**

   ```sql
   SELECT COUNT(*) FROM farms;
   ```

2. **Total Hectares:**

   ```sql
   SELECT SUM(total_area) FROM farms;
   ```

3. **Farms by State:**

   ```sql
   SELECT state, COUNT(*) FROM farms GROUP BY state;
   ```

4. **Crops Distribution:**

   ```sql
   SELECT crop_type, COUNT(*) FROM farm_harvest_crops GROUP BY crop_type;
   ```

5. **Land Use (Arable vs. Vegetation):**
   ```sql
   SELECT
     SUM(arable_area) as total_arable,
     SUM(vegetation_area) as total_vegetation
   FROM farms;
   ```

## Migration Strategy

1. **Initial Schema:** Create all tables with proper constraints
2. **Data Validation:** Enforce business rules at application level before persistence
3. **Future Migrations:** Use TypeORM CLI to generate and run migrations
4. **Never use `synchronize: true` in production** to prevent data loss
