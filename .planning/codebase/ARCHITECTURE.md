# Architecture

**Ngày phân tích:** 2026-05-03

## Pattern Overview

**Overall:** Layered Architecture với NestJS Module Pattern

**Key Characteristics:**
- Module-based organization (NestJS modules)
- Dependency Injection (DI) container
- Repository pattern cho data access
- Service layer cho business logic
- Controller layer cho HTTP endpoints
- Global middleware/interceptors/guards/filters

## Layers

**Presentation Layer (Controllers):**
- Purpose: Xử lý HTTP requests/responses, routing, validation
- Location: `src/modules/*/controllers/`
- Contains: REST API endpoints, DTOs, request/response handling
- Depends on: Service layer
- Used by: HTTP clients (frontend, mobile apps)
- Examples:
  - `src/modules/auth/controllers/auth.controller.ts`
  - `src/modules/user/controllers/user.controller.ts`
  - `src/app.controller.ts`

**Service Layer (Business Logic):**
- Purpose: Business logic, orchestration, transaction management
- Location: `src/modules/*/services/`
- Contains: Business rules, data transformation, external service calls
- Depends on: Repository layer, external services
- Used by: Controllers
- Base class: `src/common/base/base.service.ts`
- Examples:
  - `src/modules/auth/services/auth.service.ts`
  - `src/modules/user/services/user.service.ts`
  - `src/modules/send-mail/services/send-mail.service.ts`

**Repository Layer (Data Access):**
- Purpose: Database operations, query building
- Location: `src/modules/*/repositories/`
- Contains: CRUD operations, complex queries
- Depends on: Sequelize models
- Used by: Services
- Base class: `src/common/base/base.repository.ts`
- Pattern: Generic repository với type safety
- Examples:
  - `src/modules/user/repositories/user.repository.ts`
  - `src/modules/mail-config/repositories/mail-config.repository.ts`

**Data Layer (Models & Entities):**
- Purpose: Database schema definition, ORM mapping
- Location: `src/modules/*/models/` và `src/modules/*/entities/`
- Contains:
  - Models: Sequelize models với decorators (`*.model.ts`)
  - Entities: TypeScript interfaces/types (`*.entity.ts`)
- Depends on: Sequelize-typescript
- Used by: Repositories
- Examples:
  - `src/modules/user/models/user.model.ts`
  - `src/modules/user/entities/user.entity.ts`

**Common/Shared Layer:**
- Purpose: Cross-cutting concerns, reusable components
- Location: `src/common/`
- Contains:
  - Guards: `src/common/guards/` (auth, role)
  - Interceptors: `src/common/interceptors/` (response formatting)
  - Filters: `src/common/filters/` (exception handling)
  - Decorators: `src/common/decorators/` (custom decorators)
  - DTOs: `src/common/dto/` (shared DTOs)
  - Utils: `src/common/utils/` (helper functions)
  - Base classes: `src/common/base/`
- Depends on: NestJS core
- Used by: Tất cả layers

**Configuration Layer:**
- Purpose: Application configuration, environment variables
- Location: `src/config/`
- Contains:
  - `src/config/app.config.ts` - App settings
  - `src/config/database.config.ts` - Database config
  - `src/config/swagger.config.ts` - API docs config
- Depends on: `@nestjs/config`
- Used by: Modules, services

## Data Flow

**HTTP Request Flow:**

1. **Request arrives** → Express server
2. **Global Guards** → `AuthGuard` (JWT validation), `ThrottlerGuard` (rate limiting)
3. **Controller** → Route handler, parameter extraction, DTO validation
4. **Service** → Business logic execution
5. **Repository** → Database query via Sequelize
6. **Database** → PostgreSQL
7. **Repository** → Return data as entities
8. **Service** → Transform/process data
9. **Controller** → Return response
10. **Global Interceptor** → `ResponseInterceptor` (format response)
11. **Response sent** → Client

**Error Flow:**

1. **Exception thrown** → Any layer
2. **Global Filter** → `HttpExceptionFilter` catches exception
3. **Error logging** → NestJS Logger
4. **Error response** → Formatted JSON response với ApiResponse interface

**Authentication Flow:**

1. **Login request** → `AuthController.login()`
2. **Validate credentials** → `AuthService.login()`
3. **Check user** → `UserRepository.findByLoginIdentifier()`
4. **Verify password** → bcrypt.compare()
5. **Generate tokens** → JWT access token + refresh token
6. **Store refresh token** → Database
7. **Return tokens** → Client

**Subsequent Authenticated Requests:**

1. **Request with Bearer token** → Any protected endpoint
2. **AuthGuard** → Extract JWT from header
3. **JwtStrategy** → Validate token, extract payload
4. **Request.user** → Populated với user data
5. **Controller** → Access user via `@User()` decorator
6. **Process request** → Normal flow

**State Management:**
- Stateless authentication (JWT tokens)
- Session data stored in JWT payload
- Refresh tokens stored in database
- No server-side session storage

## Key Abstractions

**BaseRepository:**
- Purpose: Generic CRUD operations cho tất cả entities
- Location: `src/common/base/base.repository.ts`
- Pattern: Generic class với type parameter `<E extends BaseEntity>`
- Methods:
  - `getMany()` - Fetch multiple records
  - `getPage()` - Paginated query
  - `getOne()` - Single record
  - `getById()` - By primary key
  - `create()` - Insert
  - `insertMany()` - Bulk insert
  - `updateOne()`, `updateMany()` - Update operations
  - `deleteOne()`, `deleteMany()` - Delete operations
  - `count()`, `exists()` - Aggregations
- Usage: Extend trong module repositories

**BaseService:**
- Purpose: Generic service operations
- Location: `src/common/base/base.service.ts`
- Pattern: Generic class với type parameter `<T extends BaseEntity>`
- Methods: Wrapper around repository methods
- Usage: Extend trong module services

**Module Pattern:**
- Purpose: Encapsulate related functionality
- Structure:
  ```
  module/
  ├── controllers/    # HTTP endpoints
  ├── services/       # Business logic
  ├── repositories/   # Data access
  ├── models/         # Sequelize models
  ├── entities/       # TypeScript types
  ├── dto/            # Data transfer objects
  ├── strategies/     # Passport strategies (auth)
  └── module.ts       # Module definition
  ```
- Examples: auth, user, notification, file, send-mail

**DTO Pattern:**
- Purpose: Data validation và transformation
- Location: `src/modules/*/dto/`
- Validation: class-validator decorators
- Transformation: class-transformer
- Usage: Controller method parameters
- Examples:
  - `src/modules/auth/dto/login.dto.ts`
  - `src/modules/auth/dto/register.dto.ts`

**Decorator Pattern:**
- Purpose: Metadata và behavior injection
- Location: `src/common/decorators/`
- Types:
  - `@Public()` - Skip authentication
  - `@User()` - Extract user from request
  - `@Roles()` - Role-based access
  - `@Auth()` - Combined auth decorators
  - `@RequestQuery()` - Query parameter extraction
  - `@RequestCondition()` - Conditional logic
- Usage: Controller methods và parameters

## Entry Points

**Main Application:**
- Location: `src/main.ts`
- Triggers: `npm start`, `npm run start:dev`, `npm run start:prod`
- Responsibilities:
  - Create NestJS application
  - Configure global pipes (ValidationPipe)
  - Enable CORS
  - Set global prefix (`api/`)
  - Setup Swagger documentation
  - Start HTTP server

**Root Module:**
- Location: `src/app.module.ts`
- Responsibilities:
  - Import feature modules
  - Configure global providers (filters, interceptors, guards)
  - Setup ConfigModule
  - Setup ThrottlerModule
  - Setup DatabaseModule

**Database Bootstrap:**
- Location: `src/database/database.module.ts`
- Triggers: Application startup
- Responsibilities:
  - Connect to PostgreSQL
  - Auto-load models
  - Sync schema (if enabled)

## Error Handling

**Strategy:** Centralized exception handling với global filter

**Patterns:**

**Custom API Errors:**
- Location: `src/common/exceptions/api-error.ts`
- Usage: `throw ApiError.BadRequest('message')`
- Types: BadRequest, Unauthorized, Forbidden, NotFound, Conflict, InternalServerError

**Global Exception Filter:**
- Location: `src/common/filters/http-exception.filter.ts`
- Catches: Tất cả exceptions (HttpException và Error)
- Behavior:
  - Log error với stack trace
  - Format error response
  - Return standardized JSON

**Validation Errors:**
- Automatic via ValidationPipe
- Returns 400 Bad Request với validation details

**Database Errors:**
- Caught by services
- Transformed to ApiError
- Examples: Unique constraint violations → Conflict error

## Cross-Cutting Concerns

**Logging:**
- NestJS Logger service
- Usage:
  - HTTP exceptions (HttpExceptionFilter)
  - Email sending (SendMailService)
  - Database queries (development mode)
- Format: Timestamp, context, message, stack trace

**Validation:**
- Global ValidationPipe
- class-validator decorators trên DTOs
- Automatic validation trước khi vào controller
- Options:
  - whitelist: true (strip unknown properties)
  - forbidNonWhitelisted: true (reject unknown properties)
  - transform: true (auto-transform types)

**Authentication:**
- JWT-based với Passport
- Global AuthGuard (applied to all routes)
- Bypass với `@Public()` decorator
- Token extraction từ Authorization header
- Strategy: `src/modules/auth/strategies/jwt.strategy.ts`

**Authorization:**
- Role-based access control
- RoleGuard: `src/common/guards/role.guard.ts`
- `@Roles()` decorator
- Check user role từ JWT payload

**Response Formatting:**
- Global ResponseInterceptor
- Location: `src/common/interceptors/response.interceptor.ts`
- Format:
  ```typescript
  {
    success: boolean,
    statusCode: number,
    path: string,
    timestamp: string,
    data: any,
    meta?: { total, page, limit, totalPages } // for paginated
  }
  ```

**Rate Limiting:**
- ThrottlerGuard (global)
- Default: 10 requests per 10 seconds
- Custom limits với `@Throttle()` decorator
- Example: forgot-password (1 request per 60 seconds)

**CORS:**
- Enabled globally
- Allow all origins (*)
- Allow credentials

**API Documentation:**
- Swagger/OpenAPI
- Auto-generated từ decorators
- Endpoint: `/api/docs`
- Config: `src/config/swagger.config.ts`
- Features:
  - Bearer auth support
  - Persist authorization
  - Introspect comments

---

*Phân tích architecture: 2026-05-03*
