# Brain Agriculture - System Architecture

> **Version**: 0.0.1  
> **Last Updated**: November 24, 2025  
> **Stack**: Bun + NestJS + TypeORM + React + Redux Toolkit  
> **Pattern**: Monorepo with workspace separation  
> **Assessment**: Full-stack rural producer and farm management system

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Component Structure](#component-structure)
4. [Data Flow](#data-flow)
5. [Module Organization](#module-organization)
6. [API Design](#api-design)
7. [Security Architecture](#security-architecture)
8. [Scalability Considerations](#scalability-considerations)

---

## System Overview

### High-Level Context Diagram (C4 Level 1)

```mermaid
C4Context
    title System Context - Brain Agriculture Platform

    Person(user, "Rural Producer", "Agricultural producer managing farms and crops")
    Person(admin, "System Administrator", "Manages system configuration and monitoring")

    System(webapp, "Brain Agriculture Web App", "React SPA for farm and producer management")
    System(api, "Backend API", "NestJS REST API with business logic")
    SystemDb(database, "SQLite Database", "Stores producers, farms, harvests, and crops")

    System_Ext(monitoring, "Monitoring System", "Grafana/Prometheus (future)")
    System_Ext(cloud, "Cloud Storage", "AWS S3 for documents (future)")

    Rel(user, webapp, "Uses", "HTTPS")
    Rel(admin, webapp, "Manages", "HTTPS")
    Rel(webapp, api, "Makes API calls", "REST/JSON")
    Rel(api, database, "Reads/Writes", "TypeORM")
    Rel(api, monitoring, "Sends metrics", "JSON logs")
    Rel(api, cloud, "Uploads files", "AWS SDK")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### Container Diagram (C4 Level 2)

```mermaid
C4Container
    title Container Diagram - Brain Agriculture System

    Person(user, "Rural Producer", "Uses web interface")

    Container_Boundary(frontend, "Frontend Application") {
        Container(spa, "React SPA", "TypeScript, React 18, Vite", "Provides UI for farm management")
        Container(redux, "Redux Store", "Redux Toolkit + RTK Query", "Manages application state")
    }

    Container_Boundary(backend, "Backend Application") {
        Container(api, "NestJS API", "TypeScript, Bun runtime", "Handles business logic and REST endpoints")
        Container(services, "Business Services", "NestJS Services", "Domain logic and validations")
        Container(repositories, "Data Repositories", "TypeORM Repositories", "Data access layer")
    }

    ContainerDb(db, "SQLite Database", "better-sqlite3", "Stores all application data")

    Container(logger, "Logging Service", "Pino", "Structured JSON logging")

    Rel(user, spa, "Interacts with", "HTTPS")
    Rel(spa, redux, "Dispatches actions", "")
    Rel(redux, api, "HTTP requests", "REST/JSON")
    Rel(api, services, "Delegates to", "DI")
    Rel(services, repositories, "Uses", "Repository pattern")
    Rel(repositories, db, "Queries", "SQL via TypeORM")
    Rel(api, logger, "Logs events", "Structured logs")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## Architecture Patterns

### Layered Architecture

The backend follows a **strict layered architecture** to ensure separation of concerns:

```mermaid
graph TD
    subgraph "Presentation Layer"
        A[Controllers] --> A1[HTTP Request Handling]
        A --> A2[DTO Validation]
        A --> A3[Response Formatting]
    end

    subgraph "Business Logic Layer"
        B[Services] --> B1[Business Rules]
        B --> B2[Transaction Management]
        B --> B3[Domain Logic]
    end

    subgraph "Data Access Layer"
        C[Repositories] --> C1[TypeORM Repositories]
        C --> C2[Query Building]
        C --> C3[Entity Mapping]
    end

    subgraph "Data Layer"
        D[Database] --> D1[SQLite]
        D --> D2[Migrations]
        D --> D3[Constraints]
    end

    A --> B
    B --> C
    C --> D

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#e8f5e9
    style D fill:#f3e5f5
```

### Design Patterns in Use

| Pattern                  | Location          | Purpose                               | Example                                |
| ------------------------ | ----------------- | ------------------------------------- | -------------------------------------- |
| **Repository**           | Data Access Layer | Abstract database operations          | `ProducerRepository`, `FarmRepository` |
| **Data Mapper**          | TypeORM Entities  | Separate domain objects from database | All `*.entity.ts` files                |
| **Dependency Injection** | NestJS Modules    | Manage dependencies and lifecycle     | `@Injectable()`, `@Inject()`           |
| **DTO Pattern**          | Controllers       | Validate and transform input/output   | `CreateProducerDto`, `UpdateFarmDto`   |
| **Factory Pattern**      | Testing/Seeding   | Create test data                      | `ProducerFactory`, `FarmFactory`       |
| **Strategy Pattern**     | Validators        | Pluggable validation logic            | `validateCPF`, `validateCNPJ`          |
| **Observer Pattern**     | Logging           | Track events across layers            | Pino logger with context               |
| **Singleton**            | Configuration     | Single config instance                | `ConfigService`                        |

---

## Component Structure

### Backend Component Diagram (C4 Level 3)

```mermaid
C4Component
    title Component Diagram - Backend API

    Container_Boundary(api, "NestJS API") {
        Component(appModule, "App Module", "NestJS", "Root application module")

        Component(producersModule, "Producers Module", "NestJS", "Producer management")
        Component(farmsModule, "Farms Module", "NestJS", "Farm management")
        Component(dashboardModule, "Dashboard Module", "NestJS", "Analytics and reports")

        Component(producersCtrl, "Producers Controller", "NestJS", "Producer endpoints")
        Component(producersService, "Producers Service", "NestJS", "Producer business logic")

        Component(farmsCtrl, "Farms Controller", "NestJS", "Farm endpoints")
        Component(farmsService, "Farms Service", "NestJS", "Farm business logic")

        Component(dashboardCtrl, "Dashboard Controller", "NestJS", "Dashboard endpoints")
        Component(dashboardService, "Dashboard Service", "NestJS", "Aggregations and stats")

        Component(validators, "Validators", "Shared Package", "CPF, CNPJ, area validation")
        Component(logger, "Logger Service", "Pino", "Structured logging")
        Component(config, "Config Service", "NestJS", "Environment configuration")
    }

    ContainerDb(db, "Database", "TypeORM + SQLite", "Data persistence")

    Rel(appModule, producersModule, "Imports")
    Rel(appModule, farmsModule, "Imports")
    Rel(appModule, dashboardModule, "Imports")

    Rel(producersModule, producersCtrl, "Provides")
    Rel(producersModule, producersService, "Provides")
    Rel(producersCtrl, producersService, "Uses")
    Rel(producersService, validators, "Uses")
    Rel(producersService, db, "Queries", "TypeORM")

    Rel(farmsModule, farmsCtrl, "Provides")
    Rel(farmsModule, farmsService, "Provides")
    Rel(farmsCtrl, farmsService, "Uses")
    Rel(farmsService, validators, "Uses")
    Rel(farmsService, db, "Queries", "TypeORM")

    Rel(dashboardModule, dashboardCtrl, "Provides")
    Rel(dashboardModule, dashboardService, "Provides")
    Rel(dashboardCtrl, dashboardService, "Uses")
    Rel(dashboardService, db, "Aggregates", "TypeORM")

    Rel(producersService, logger, "Logs events")
    Rel(farmsService, logger, "Logs events")
    Rel(dashboardService, logger, "Logs events")

    Rel(producersService, config, "Reads config")
    Rel(farmsService, config, "Reads config")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

### Project Structure

```
brain-ag/
├── apps/
│   ├── api/                          # Backend NestJS application
│   │   ├── src/
│   │   │   ├── main.ts               # Application entry point
│   │   │   ├── app.module.ts         # Root module with imports
│   │   │   │
│   │   │   ├── common/               # Shared infrastructure
│   │   │   │   ├── filters/          # Exception filters
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── interceptors/     # Request/response interceptors
│   │   │   │   │   ├── logging.interceptor.ts
│   │   │   │   │   └── correlation-id.interceptor.ts
│   │   │   │   ├── guards/           # Route guards (auth, roles)
│   │   │   │   ├── decorators/       # Custom decorators
│   │   │   │   └── pipes/            # Validation pipes
│   │   │   │
│   │   │   ├── config/               # Configuration modules
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── logger.config.ts
│   │   │   │   └── swagger.config.ts
│   │   │   │
│   │   │   ├── database/             # Database-related files
│   │   │   │   ├── data-source.ts    # TypeORM DataSource
│   │   │   │   ├── entities/         # TypeORM entities
│   │   │   │   │   ├── producer.entity.ts
│   │   │   │   │   ├── farm.entity.ts
│   │   │   │   │   ├── harvest.entity.ts
│   │   │   │   │   ├── farm-harvest.entity.ts
│   │   │   │   │   ├── farm-harvest-crop.entity.ts
│   │   │   │   │   ├── enums.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── migrations/       # TypeORM migrations
│   │   │   │   │   └── 1732406400000-InitialSchema.ts
│   │   │   │   └── seeds/            # Database seed scripts
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── producers/            # Producer feature module
│   │   │   │   ├── producers.module.ts
│   │   │   │   ├── producers.controller.ts
│   │   │   │   ├── producers.service.ts
│   │   │   │   ├── producers.service.spec.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-producer.dto.ts
│   │   │   │       ├── update-producer.dto.ts
│   │   │   │       └── producer-response.dto.ts
│   │   │   │
│   │   │   ├── farms/                # Farm feature module
│   │   │   │   ├── farms.module.ts
│   │   │   │   ├── farms.controller.ts
│   │   │   │   ├── farms.service.ts
│   │   │   │   ├── farms.service.spec.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-farm.dto.ts
│   │   │   │       ├── update-farm.dto.ts
│   │   │   │       └── farm-response.dto.ts
│   │   │   │
│   │   │   ├── dashboard/            # Dashboard analytics module
│   │   │   │   ├── dashboard.module.ts
│   │   │   │   ├── dashboard.controller.ts
│   │   │   │   ├── dashboard.service.ts
│   │   │   │   ├── dashboard.service.spec.ts
│   │   │   │   └── dto/
│   │   │   │       └── dashboard-stats.dto.ts
│   │   │   │
│   │   │   └── utils/                # Backend-specific utilities
│   │   │       ├── logger.util.ts
│   │   │       ├── env.util.ts
│   │   │       └── constants.util.ts
│   │   │
│   │   ├── test/                     # E2E tests
│   │   │   ├── app.e2e-spec.ts
│   │   │   ├── producers.e2e-spec.ts
│   │   │   └── farms.e2e-spec.ts
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   │
│   └── web/                          # Frontend React application
│       ├── src/
│       │   ├── main.tsx              # Application entry point
│       │   ├── App.tsx               # Root component
│       │   │
│       │   ├── config/               # Configuration
│       │   │   ├── env.ts
│       │   │   └── constants.ts
│       │   │
│       │   ├── store/                # Redux store
│       │   │   ├── index.ts          # Store configuration
│       │   │   ├── hooks.ts          # Typed hooks
│       │   │   └── api/              # RTK Query API slices
│       │   │       ├── producers.ts
│       │   │       ├── farms.ts
│       │   │       └── dashboard.ts
│       │   │
│       │   ├── components/           # Atomic Design components
│       │   │   ├── atoms/            # Basic building blocks
│       │   │   │   ├── Button/
│       │   │   │   ├── Input/
│       │   │   │   └── Label/
│       │   │   ├── molecules/        # Simple composites
│       │   │   │   ├── FormField/
│       │   │   │   ├── Card/
│       │   │   │   └── SearchBar/
│       │   │   ├── organisms/        # Complex components
│       │   │   │   ├── ProducerForm/
│       │   │   │   ├── ProducerList/
│       │   │   │   └── DashboardGrid/
│       │   │   └── templates/        # Page layouts
│       │   │       └── MainLayout/
│       │   │
│       │   ├── features/             # Feature-specific code
│       │   │   ├── producers/
│       │   │   │   ├── ProducersPage.tsx
│       │   │   │   ├── ProducerDetailPage.tsx
│       │   │   │   └── hooks/
│       │   │   ├── farms/
│       │   │   └── dashboard/
│       │   │
│       │   ├── hooks/                # Shared custom hooks
│       │   │   ├── useDebounce.ts
│       │   │   └── useLocalStorage.ts
│       │   │
│       │   ├── theme/                # Theme configuration
│       │   │   ├── theme.ts
│       │   │   └── GlobalStyles.ts
│       │   │
│       │   └── utils/                # Frontend utilities
│       │       └── formatters.ts
│       │
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                       # Shared code between apps
│       ├── src/
│       │   ├── index.ts
│       │   ├── types/                # Shared TypeScript types
│       │   │   └── index.ts
│       │   ├── validators/           # Business validation logic
│       │   │   ├── cpf.validator.ts
│       │   │   ├── cnpj.validator.ts
│       │   │   ├── farm-area.validator.ts
│       │   │   └── index.ts
│       │   └── utils/                # Shared utilities
│       │       ├── logger.util.ts
│       │       ├── env.util.ts
│       │       └── constants.util.ts
│       │
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # This file
│   ├── DATABASE_SCHEMA.md            # Database design
│   ├── ENVIRONMENT.md                # Environment variables
│   └── MONOREPO.md                   # Monorepo setup guide
│
├── .github/
│   ├── instructions/                 # AI/LLM coding guidelines
│   │   ├── backend.instructions.md
│   │   ├── frontend.instructions.md
│   │   ├── typescript.instructions.md
│   │   ├── jsdocs.instructions.md
│   │   └── testing.instructions.md
│   └── copilot-instructions.md       # Global Copilot settings
│
├── package.json                      # Root workspace config
├── tsconfig.json                     # Root TypeScript config
├── tsconfig.base.json                # Shared TypeScript config
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment template
└── README.md                         # Project overview
```

---

## Data Flow

### Request/Response Flow

```mermaid
sequenceDiagram
    actor User
    participant Web as React SPA
    participant Redux as Redux Store
    participant API as NestJS API
    participant Guard as Auth Guard
    participant Interceptor as Logging Interceptor
    participant Controller as Controller
    participant Service as Service
    participant Validator as Validators
    participant Repo as Repository
    participant DB as SQLite Database

    User->>Web: Fill form (create producer)
    Web->>Redux: Dispatch createProducer action
    Redux->>API: POST /api/producers<br/>{name, document}

    API->>Guard: Check authentication
    Guard-->>API: Authorized ✓

    API->>Interceptor: Log request<br/>(correlation ID)
    Interceptor-->>API: Continue

    API->>Controller: Handle POST request
    Controller->>Controller: Validate DTO<br/>(class-validator)

    Controller->>Service: createProducer(dto)
    Service->>Validator: validateCPF(document)
    Validator-->>Service: Valid ✓

    Service->>Repo: repository.create()
    Repo->>DB: INSERT INTO producers
    DB-->>Repo: Producer entity
    Repo-->>Service: Producer

    Service->>Interceptor: Log success event
    Service-->>Controller: Producer DTO
    Controller-->>API: 201 Created

    API->>Interceptor: Log response
    API-->>Redux: {id, name, document}
    Redux-->>Web: Update state
    Web-->>User: Show success message
```

### State Management Flow (Frontend)

```mermaid
graph LR
    subgraph "User Actions"
        A[User Interaction]
    end

    subgraph "React Components"
        B[Component]
        C[Form Component]
    end

    subgraph "Redux Toolkit"
        D[RTK Query Hook]
        E[Redux Store]
        F[API Slice]
    end

    subgraph "Backend API"
        G[REST Endpoint]
    end

    A --> B
    A --> C
    B --> D
    C --> D
    D --> F
    F --> G
    G --> F
    F --> E
    E --> D
    D --> B
    D --> C

    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#fff3e0
    style D fill:#f3e5f5
    style E fill:#f3e5f5
    style F fill:#f3e5f5
    style G fill:#e8f5e9
```

### Database Access Flow

```mermaid
graph TD
    A[Service Layer] --> B{Transaction Needed?}
    B -->|Yes| C[Begin Transaction]
    B -->|No| D[Repository Method]

    C --> E[Repository Method 1]
    E --> F[Repository Method 2]
    F --> G{Success?}
    G -->|Yes| H[Commit Transaction]
    G -->|No| I[Rollback Transaction]

    D --> J[TypeORM QueryBuilder]
    H --> J
    I --> K[Throw Error]

    J --> L[Generate SQL]
    L --> M[Execute Query]
    M --> N[better-sqlite3 Driver]
    N --> O[SQLite Database]
    O --> P[Return Results]
    P --> Q[Map to Entities]
    Q --> R[Return to Service]

    style A fill:#e1f5ff
    style C fill:#fff9c4
    style H fill:#c8e6c9
    style I fill:#ffcdd2
    style K fill:#ffcdd2
    style O fill:#f3e5f5
```

---

## Module Organization

### NestJS Module Dependency Graph

```mermaid
graph TD
    AppModule[App Module<br/>Root Module]

    ConfigModule[Config Module<br/>Environment Config]
    TypeOrmModule[TypeORM Module<br/>Database Connection]
    LoggerModule[Logger Module<br/>Pino Logging]
    ThrottlerModule[Throttler Module<br/>Rate Limiting]

    ProducersModule[Producers Module<br/>Producer Management]
    FarmsModule[Farms Module<br/>Farm Management]
    DashboardModule[Dashboard Module<br/>Analytics]

    SharedValidators[Shared Validators<br/>@agro/shared]

    AppModule --> ConfigModule
    AppModule --> TypeOrmModule
    AppModule --> LoggerModule
    AppModule --> ThrottlerModule
    AppModule --> ProducersModule
    AppModule --> FarmsModule
    AppModule --> DashboardModule

    ProducersModule --> TypeOrmModule
    ProducersModule --> LoggerModule
    ProducersModule --> SharedValidators

    FarmsModule --> TypeOrmModule
    FarmsModule --> LoggerModule
    FarmsModule --> SharedValidators
    FarmsModule --> ProducersModule

    DashboardModule --> TypeOrmModule
    DashboardModule --> LoggerModule

    style AppModule fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style ConfigModule fill:#fff3e0,stroke:#f57c00
    style TypeOrmModule fill:#f3e5f5,stroke:#7b1fa2
    style LoggerModule fill:#e8f5e9,stroke:#388e3c
    style ProducersModule fill:#ffe0b2,stroke:#e64a19
    style FarmsModule fill:#ffe0b2,stroke:#e64a19
    style DashboardModule fill:#ffe0b2,stroke:#e64a19
    style SharedValidators fill:#fff9c4,stroke:#f9a825
```

### Feature Module Structure Pattern

Each feature module follows this consistent structure:

```mermaid
classDiagram
    class FeatureModule {
        +imports: Module[]
        +controllers: Controller[]
        +providers: Provider[]
        +exports: Provider[]
    }

    class Controller {
        +constructor(service)
        +create()
        +findAll()
        +findOne()
        +update()
        +delete()
    }

    class Service {
        +constructor(repository, logger)
        -repository: Repository
        -logger: Logger
        +create()
        +findAll()
        +findOne()
        +update()
        +delete()
        -validateBusinessRules()
    }

    class Repository {
        +extends Repository~Entity~
        +customQueryMethods()
    }

    class Entity {
        +id: string
        +createdAt: Date
        +updatedAt: Date
    }

    class DTO {
        <<interface>>
        +validation decorators
    }

    FeatureModule --> Controller
    FeatureModule --> Service
    Controller --> Service
    Service --> Repository
    Repository --> Entity
    Controller --> DTO
    Service --> DTO
```

---

## API Design

### REST API Endpoints Structure

```mermaid
graph LR
    subgraph "Producers API"
        P1[POST /api/producers]
        P2[GET /api/producers]
        P3[GET /api/producers/:id]
        P4[PATCH /api/producers/:id]
        P5[DELETE /api/producers/:id]
    end

    subgraph "Farms API"
        F1[POST /api/farms]
        F2[GET /api/farms]
        F3[GET /api/farms/:id]
        F4[PATCH /api/farms/:id]
        F5[DELETE /api/farms/:id]
    end

    subgraph "Dashboard API"
        D1[GET /api/dashboard/summary]
        D2[GET /api/dashboard/farms-by-state]
        D3[GET /api/dashboard/crops-distribution]
        D4[GET /api/dashboard/land-use]
    end

    subgraph "Health API"
        H1[GET /health]
        H2[GET /health/ready]
    end

    style P1 fill:#bbdefb
    style P2 fill:#c8e6c9
    style P3 fill:#c8e6c9
    style P4 fill:#fff9c4
    style P5 fill:#ffcdd2

    style F1 fill:#bbdefb
    style F2 fill:#c8e6c9
    style F3 fill:#c8e6c9
    style F4 fill:#fff9c4
    style F5 fill:#ffcdd2

    style D1 fill:#c8e6c9
    style D2 fill:#c8e6c9
    style D3 fill:#c8e6c9
    style D4 fill:#c8e6c9

    style H1 fill:#e1bee7
    style H2 fill:#e1bee7
```

### API Contract Standards

| Aspect              | Standard              | Example                                                           |
| ------------------- | --------------------- | ----------------------------------------------------------------- |
| **Base Path**       | `/api` prefix         | `/api/producers`, `/api/farms`                                    |
| **Versioning**      | URL path (future)     | `/api/v1/producers`, `/api/v2/producers`                          |
| **Resource Naming** | Plural nouns          | `/producers`, `/farms` (not `/producer`)                          |
| **HTTP Methods**    | RESTful semantics     | POST=Create, GET=Read, PATCH=Update, DELETE=Remove                |
| **Status Codes**    | Standard HTTP         | 200 OK, 201 Created, 400 Bad Request, 404 Not Found               |
| **Request Body**    | JSON with DTOs        | `{ "name": "...", "document": "..." }`                            |
| **Response Body**   | JSON with DTOs        | `{ "id": "uuid", "name": "...", "createdAt": "..." }`             |
| **Error Format**    | NestJS standard       | `{ "statusCode": 400, "message": "...", "error": "Bad Request" }` |
| **Pagination**      | Query params          | `?page=1&limit=20`                                                |
| **Filtering**       | Query params          | `?state=SP&crop=Soja`                                             |
| **Sorting**         | Query params          | `?sort=name:asc,createdAt:desc`                                   |
| **Field Selection** | Query params (future) | `?fields=id,name,document`                                        |

### OpenAPI Documentation Structure

All endpoints are documented using `@nestjs/swagger` decorators:

```typescript
@Controller("producers")
@ApiTags("Producers")
export class ProducersController {
	@Post()
	@ApiOperation({ summary: "Create a new producer" })
	@ApiResponse({
		status: 201,
		description: "Producer created successfully",
		type: ProducerResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: "Invalid input (CPF/CNPJ validation failed)",
	})
	async create(@Body() dto: CreateProducerDto): Promise<ProducerResponseDto> {
		// Implementation
	}
}
```

---

## Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Network Layer"
        A[HTTPS/TLS]
        B[CORS Configuration]
        C[Rate Limiting]
    end

    subgraph "Application Layer"
        D[Helmet Middleware]
        E[Input Validation]
        F[DTO Transformation]
        G[SQL Injection Prevention]
    end

    subgraph "Business Layer"
        H[Authentication Guard]
        I[Authorization Guard]
        J[Business Rule Validation]
    end

    subgraph "Data Layer"
        K[Parameterized Queries]
        L[Transaction Isolation]
        M[Audit Logging]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M

    style A fill:#c8e6c9
    style B fill:#c8e6c9
    style C fill:#c8e6c9
    style D fill:#fff9c4
    style E fill:#fff9c4
    style F fill:#fff9c4
    style G fill:#fff9c4
    style H fill:#ffccbc
    style I fill:#ffccbc
    style J fill:#ffccbc
    style K fill:#f3e5f5
    style L fill:#f3e5f5
    style M fill:#f3e5f5
```

### Security Checklist

| Security Concern            | Mitigation                 | Implementation                             |
| --------------------------- | -------------------------- | ------------------------------------------ |
| **SQL Injection**           | Parameterized queries      | TypeORM QueryBuilder with parameters       |
| **XSS Attacks**             | Input sanitization         | class-validator + class-transformer        |
| **CSRF**                    | CORS configuration         | `@nestjs/common` CORS settings             |
| **DDoS**                    | Rate limiting              | `@nestjs/throttler` (100 req/min)          |
| **Sensitive Data Exposure** | DTO transformation         | `@Exclude()` decorator on sensitive fields |
| **Security Headers**        | Helmet middleware          | Content-Security-Policy, X-Frame-Options   |
| **Authentication**          | JWT tokens (future)        | `@nestjs/jwt` + `@nestjs/passport`         |
| **Authorization**           | Role-based access (future) | Custom guards with role decorators         |
| **Audit Trail**             | Structured logging         | Pino with correlation IDs                  |

---

## Scalability Considerations

### Microservices Migration Path

The current monolithic NestJS API is designed with **microservices readiness** in mind:

```mermaid
graph TD
    subgraph "Current Monolith"
        A[NestJS API<br/>Single Process]
        B[Producers Module]
        C[Farms Module]
        D[Dashboard Module]
        E[SQLite Database]

        A --> B
        A --> C
        A --> D
        B --> E
        C --> E
        D --> E
    end

    subgraph "Future Microservices"
        F[API Gateway]
        G[Producer Service]
        H[Farm Service]
        I[Analytics Service]
        J[Producer DB<br/>PostgreSQL]
        K[Farm DB<br/>PostgreSQL]
        L[Analytics DB<br/>Read Replica]
        M[Message Queue<br/>AWS SQS/RabbitMQ]

        F --> G
        F --> H
        F --> I
        G --> J
        H --> K
        I --> L
        G -.-> M
        H -.-> M
        I -.-> M
    end

    A -.Migration Path.-> F

    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style F fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style G fill:#fff9c4
    style H fill:#fff9c4
    style I fill:#fff9c4
    style M fill:#ffccbc
```

### Horizontal Scaling Strategy

```mermaid
graph LR
    subgraph "Load Balancer"
        LB[AWS ALB / Nginx]
    end

    subgraph "Application Tier"
        API1[NestJS Instance 1]
        API2[NestJS Instance 2]
        API3[NestJS Instance N]
    end

    subgraph "Data Tier"
        DB[(PostgreSQL<br/>Primary)]
        READ1[(Read Replica 1)]
        READ2[(Read Replica 2)]
    end

    subgraph "Cache Layer"
        CACHE[Redis Cluster]
    end

    LB --> API1
    LB --> API2
    LB --> API3

    API1 --> CACHE
    API2 --> CACHE
    API3 --> CACHE

    API1 --> DB
    API2 --> DB
    API3 --> DB

    API1 -.Read.-> READ1
    API2 -.Read.-> READ2
    API3 -.Read.-> READ1

    DB -.Replication.-> READ1
    DB -.Replication.-> READ2

    style LB fill:#e3f2fd
    style API1 fill:#fff9c4
    style API2 fill:#fff9c4
    style API3 fill:#fff9c4
    style DB fill:#c8e6c9
    style READ1 fill:#e8f5e9
    style READ2 fill:#e8f5e9
    style CACHE fill:#ffccbc
```

### Performance Optimization Points

| Bottleneck                 | Solution                  | Implementation Priority |
| -------------------------- | ------------------------- | ----------------------- |
| **Database Queries**       | Indexes on foreign keys   | ✅ Implemented          |
| **N+1 Queries**            | Query optimization, joins | 🔶 Phase 2              |
| **API Response Time**      | Redis caching             | 🔶 Phase 2              |
| **Dashboard Aggregations** | Materialized views        | 🔶 Phase 3              |
| **File Uploads**           | AWS S3 direct upload      | 🔶 Phase 3              |
| **Real-time Updates**      | WebSockets (Socket.io)    | 🔶 Phase 4              |
| **Search Performance**     | Elasticsearch             | 🔶 Phase 4              |
| **Background Jobs**        | Bull Queue + Redis        | 🔶 Phase 3              |

---

## Deployment Architecture

### AWS Infrastructure (Recommended for Production)

```mermaid
graph TB
    subgraph "Users"
        U[Web Browsers]
    end

    subgraph "AWS Cloud"
        subgraph "Edge Layer"
            CF[CloudFront CDN]
            S3WEB[S3 Bucket<br/>Static Website]
        end

        subgraph "Application Layer"
            ALB[Application Load Balancer]
            ECS1[ECS Fargate<br/>NestJS Container 1]
            ECS2[ECS Fargate<br/>NestJS Container 2]
        end

        subgraph "Data Layer"
            RDS[(RDS PostgreSQL<br/>Multi-AZ)]
            REDIS[ElastiCache Redis]
        end

        subgraph "Observability"
            CW[CloudWatch Logs]
            XRAY[X-Ray Tracing]
        end

        subgraph "Queue Layer"
            SQS[SQS Queue]
            LAMBDA[Lambda Functions]
        end
    end

    U --> CF
    CF --> S3WEB
    U --> ALB
    ALB --> ECS1
    ALB --> ECS2
    ECS1 --> RDS
    ECS2 --> RDS
    ECS1 --> REDIS
    ECS2 --> REDIS
    ECS1 --> SQS
    ECS2 --> SQS
    SQS --> LAMBDA
    ECS1 --> CW
    ECS2 --> CW
    ECS1 --> XRAY
    ECS2 --> XRAY

    style U fill:#e3f2fd
    style CF fill:#c8e6c9
    style S3WEB fill:#c8e6c9
    style ALB fill:#fff9c4
    style ECS1 fill:#ffccbc
    style ECS2 fill:#ffccbc
    style RDS fill:#f3e5f5
    style REDIS fill:#ffccbc
    style CW fill:#e1bee7
    style XRAY fill:#e1bee7
    style SQS fill:#fff59d
    style LAMBDA fill:#ffab91
```

### Docker Containerization

Both frontend and backend are containerized with multi-stage builds:

**Backend Dockerfile Pattern:**

```dockerfile
# Stage 1: Build
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Stage 2: Production
FROM oven/bun:alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["bun", "run", "start:prod"]
```

**Frontend Dockerfile Pattern:**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Nginx serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Observability Strategy

### Logging Architecture

```mermaid
graph LR
    subgraph "Application"
        A[NestJS Services]
        B[Pino Logger]
        C[Correlation ID Interceptor]
    end

    subgraph "Log Processing"
        D[Structured JSON Logs]
        E[Log Aggregator<br/>Fluent Bit]
    end

    subgraph "Storage & Analysis"
        F[CloudWatch Logs]
        G[Elasticsearch]
        H[S3 Archive]
    end

    subgraph "Visualization"
        I[Grafana Dashboards]
        J[Kibana]
    end

    A --> B
    C --> B
    B --> D
    D --> E
    E --> F
    E --> G
    F --> H
    G --> I
    G --> J

    style A fill:#e3f2fd
    style B fill:#fff9c4
    style C fill:#fff9c4
    style D fill:#c8e6c9
    style E fill:#c8e6c9
    style F fill:#f3e5f5
    style G fill:#f3e5f5
    style H fill:#f3e5f5
    style I fill:#ffccbc
    style J fill:#ffccbc
```

### Log Structure Standard

All logs follow a consistent JSON structure optimized for machine parsing:

```json
{
	"timestamp": "2025-11-24T12:00:00.000Z",
	"level": "info",
	"correlationId": "abc-123-def-456",
	"service": "producers-service",
	"method": "createProducer",
	"userId": "user-uuid",
	"message": "Producer created successfully",
	"context": {
		"producerId": "prod-uuid",
		"document": "111.444.777-35",
		"durationMs": 45
	}
}
```

### Metrics and Monitoring

| Metric Category            | Examples                            | Tool             |
| -------------------------- | ----------------------------------- | ---------------- |
| **Application Metrics**    | Request rate, error rate, latency   | Prometheus       |
| **Business Metrics**       | Producers created, farms registered | Custom logs      |
| **Infrastructure Metrics** | CPU, memory, disk usage             | CloudWatch       |
| **Database Metrics**       | Query performance, connection pool  | TypeORM logging  |
| **User Analytics**         | Page views, feature usage           | Google Analytics |

---

## Conclusion

This architecture provides a solid foundation for the Brain Agriculture platform with:

- ✅ **Separation of Concerns**: Clear layered architecture
- ✅ **Scalability**: Microservices-ready design
- ✅ **Maintainability**: Modular structure with consistent patterns
- ✅ **Testability**: Dependency injection and repository pattern
- ✅ **Observability**: Structured logging and monitoring readiness
- ✅ **Security**: Defense-in-depth approach
- ✅ **Performance**: Optimization points identified

**Next Steps**: Implement Service & Repository Layer with NestJS services and TypeORM repositories for the Producers and Farms domains.
