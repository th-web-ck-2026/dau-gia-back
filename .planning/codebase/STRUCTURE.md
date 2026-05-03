# Codebase Structure

**Ngày phân tích:** 2026-05-03

## Directory Layout

```
back/
├── src/                    # Source code chính
│   ├── modules/           # Feature modules
│   ├── common/            # Shared code
│   ├── config/            # Configuration files
│   ├── database/          # Database module
│   ├── main.ts            # Application entry point
│   ├── app.module.ts      # Root module
│   ├── app.controller.ts  # Root controller
│   └── app.service.ts     # Root service
├── dist/                  # Compiled JavaScript output
├── test/                  # E2E tests
├── node_modules/          # Dependencies
├── .claude/               # Claude AI configuration
├── .planning/             # Planning documents
│   └── codebase/         # Codebase analysis docs
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript config
├── nest-cli.json          # NestJS CLI config
├── .prettierrc            # Code formatting rules
├── .gitignore             # Git ignore rules
├── .dockerignore          # Docker ignore rules
└── .env                   # Environment variables (not committed)
```

## Directory Purposes

**src/**
- Purpose: Toàn bộ source code TypeScript
- Contains: Modules, common code, config, entry point
- Key files:
  - `main.ts` - Bootstrap application
  - `app.module.ts` - Root module definition

**src/modules/**
- Purpose: Feature modules (domain-driven organization)
- Contains: Business logic modules
- Structure: Mỗi module có controllers, services, repositories, models, DTOs
- Modules hiện có:
  - `auth/` - Authentication & authorization
  - `user/` - User management
  - `notification/` - Notifications
  - `file/` - File handling
  - `send-mail/` - Email sending
  - `mail-config/` - Email configuration
  - `recaptcha/` - reCAPTCHA validation

**src/common/**
- Purpose: Shared code, utilities, base classes
- Contains: Guards, interceptors, filters, decorators, DTOs, utils
- Subdirectories:
  - `base/` - Base repository & service classes
  - `guards/` - Authentication & authorization guards
  - `interceptors/` - Response transformation
  - `filters/` - Exception handling
  - `decorators/` - Custom decorators
  - `dto/` - Shared DTOs (pagination)
  - `pipe/` - Custom pipes & interfaces
  - `utils/` - Helper functions
  - `exceptions/` - Custom exceptions
  - `constants/` - Constants & enums
  - `interfaces/` - TypeScript interfaces

**src/config/**
- Purpose: Application configuration
- Contains: Config factories cho NestJS ConfigModule
- Key files:
  - `app.config.ts` - App settings (JWT, PayOS, File)
  - `database.config.ts` - Sequelize config
  - `swagger.config.ts` - API documentation setup
  - `index.ts` - Config exports

**src/database/**
- Purpose: Database module setup
- Contains: DatabaseModule definition
- Key files:
  - `database.module.ts` - Sequelize module configuration

**dist/**
- Purpose: Compiled JavaScript output
- Contains: Transpiled code từ TypeScript
- Generated: Bởi `npm run build`
- Committed: No (trong .gitignore)

**test/**
- Purpose: End-to-end tests
- Contains: E2E test files
- Key files:
  - `app.e2e-spec.ts` - E2E test suite
  - `jest-e2e.json` - Jest E2E config

**.claude/**
- Purpose: Claude AI configuration
- Contains: AI assistant settings

**.planning/**
- Purpose: Project planning documents
- Contains: Codebase analysis, architecture docs
- Subdirectory:
  - `codebase/` - Codebase mapping documents

## Key File Locations

**Entry Points:**
- `src/main.ts` - Application bootstrap, server setup
- `src/app.module.ts` - Root module, imports all feature modules

**Configuration:**
- `tsconfig.json` - TypeScript compiler options
- `nest-cli.json` - NestJS CLI settings
- `.prettierrc` - Code formatting (single quotes, trailing commas)
- `package.json` - Dependencies, scripts
- `.env` - Environment variables (not in repo)

**Core Logic:**
- `src/modules/auth/` - Authentication logic
- `src/modules/user/` - User management
- `src/common/base/` - Base classes cho repository & service patterns

**Testing:**
- `test/app.e2e-spec.ts` - E2E tests
- `test/jest-e2e.json` - E2E Jest config
- `package.json` (jest section) - Unit test config

## Naming Conventions

**Files:**
- Controllers: `*.controller.ts` (e.g., `auth.controller.ts`)
- Services: `*.service.ts` (e.g., `auth.service.ts`)
- Repositories: `*.repository.ts` (e.g., `user.repository.ts`)
- Models: `*.model.ts` (e.g., `user.model.ts`)
- Entities: `*.entity.ts` (e.g., `user.entity.ts`)
- DTOs: `*.dto.ts` (e.g., `login.dto.ts`)
- Guards: `*.guard.ts` (e.g., `auth.guard.ts`)
- Interceptors: `*.interceptor.ts` (e.g., `response.interceptor.ts`)
- Filters: `*.filter.ts` (e.g., `http-exception.filter.ts`)
- Decorators: `*.decorator.ts` (e.g., `user.decorator.ts`)
- Strategies: `*.strategy.ts` (e.g., `jwt.strategy.ts`)
- Modules: `*.module.ts` (e.g., `auth.module.ts`)
- Config: `*.config.ts` (e.g., `app.config.ts`)
- Constants: `*.constant.ts` (e.g., `base.constant.ts`)
- Utils: `*.util.ts` hoặc `*.utils.ts`
- Interfaces: `*.interface.ts`
- Tests: `*.spec.ts` (unit), `*.e2e-spec.ts` (E2E)

**Directories:**
- Lowercase với dashes: `send-mail/`, `mail-config/`
- Singular hoặc plural tùy context: `user/`, `modules/`

**Classes:**
- PascalCase: `AuthController`, `UserService`, `BaseRepository`
- Suffix theo type: `*Controller`, `*Service`, `*Repository`, `*Guard`, `*Interceptor`

**Variables & Functions:**
- camelCase: `getUserById`, `isAuthenticated`, `refreshToken`

## Where to Add New Code

**New Feature Module:**
- Primary code: `src/modules/<feature-name>/`
- Structure:
  ```
  src/modules/<feature-name>/
  ├── controllers/
  │   └── <feature>.controller.ts
  ├── services/
  │   └── <feature>.service.ts
  ├── repositories/
  │   └── <feature>.repository.ts
  ├── models/
  │   └── <feature>.model.ts
  ├── entities/
  │   └── <feature>.entity.ts
  ├── dto/
  │   ├── create-<feature>.dto.ts
  │   └── update-<feature>.dto.ts
  ├── common/
  │   └── constant.ts
  └── <feature>.module.ts
  ```
- Register module: Import vào `src/app.module.ts`

**New API Endpoint:**
- Controller: `src/modules/<module>/controllers/<module>.controller.ts`
- Service logic: `src/modules/<module>/services/<module>.service.ts`
- DTO: `src/modules/<module>/dto/<action>.dto.ts`

**New Database Model:**
- Model: `src/modules/<module>/models/<entity>.model.ts`
- Entity interface: `src/modules/<module>/entities/<entity>.entity.ts`
- Repository: `src/modules/<module>/repositories/<entity>.repository.ts`
- Register: Add to `SequelizeModule.forFeature([Model])` trong module

**New Guard/Interceptor/Filter:**
- Global scope: `src/common/guards|interceptors|filters/`
- Module-specific: `src/modules/<module>/guards|interceptors|filters/`
- Register global: Trong `src/app.module.ts` providers với `APP_GUARD`, `APP_INTERCEPTOR`, `APP_FILTER`

**New Decorator:**
- Location: `src/common/decorators/<name>.decorator.ts`
- Export: Từ decorator file

**New Utility Function:**
- Location: `src/common/utils/<category>.util.ts` hoặc `<category>.utils.ts`
- Export: Named export

**New Configuration:**
- Location: `src/config/<name>.config.ts`
- Export: Config factory function
- Load: Trong `ConfigModule.forRoot({ load: [...] })`

**New Constant/Enum:**
- Shared: `src/common/constants/<category>.constant.ts`
- Module-specific: `src/modules/<module>/common/constant.ts`

**New Interface/Type:**
- Shared: `src/common/interfaces/<name>.interface.ts`
- Module-specific: `src/modules/<module>/entities/` hoặc `interfaces/`

**Tests:**
- Unit tests: Co-located với source file (same directory, `*.spec.ts`)
- E2E tests: `test/<feature>.e2e-spec.ts`

## Special Directories

**dist/**
- Purpose: Build output
- Generated: Yes (by `nest build`)
- Committed: No
- Clean: Automatically on build (deleteOutDir: true)

**node_modules/**
- Purpose: NPM dependencies
- Generated: Yes (by `npm install`)
- Committed: No

**.planning/codebase/**
- Purpose: Codebase analysis documents
- Generated: By GSD mapping commands
- Committed: Yes (for team reference)
- Files:
  - `STACK.md` - Technology stack
  - `INTEGRATIONS.md` - External services
  - `ARCHITECTURE.md` - System architecture
  - `STRUCTURE.md` - This file

**.claude/**
- Purpose: Claude AI configuration
- Committed: Yes
- Contains: Skills, prompts, AI settings

## Module Structure Pattern

**Standard Module Layout:**
```
module-name/
├── controllers/
│   └── module-name.controller.ts    # HTTP endpoints
├── services/
│   └── module-name.service.ts       # Business logic
├── repositories/
│   └── module-name.repository.ts    # Data access
├── models/
│   └── module-name.model.ts         # Sequelize model
├── entities/
│   └── module-name.entity.ts        # TypeScript interface
├── dto/
│   ├── create-module-name.dto.ts    # Create DTO
│   ├── update-module-name.dto.ts    # Update DTO
│   └── query-module-name.dto.ts     # Query DTO
├── common/
│   └── constant.ts                   # Module constants
├── strategies/                       # (Optional) Passport strategies
├── guards/                           # (Optional) Module-specific guards
└── module-name.module.ts            # Module definition
```

**Module Registration:**
```typescript
// module-name.module.ts
@Module({
  imports: [
    SequelizeModule.forFeature([ModuleNameModel]),
    // Other module dependencies
  ],
  controllers: [ModuleNameController],
  providers: [ModuleNameService, ModuleNameRepository],
  exports: [ModuleNameService], // If used by other modules
})
export class ModuleNameModule {}
```

## Path Aliases

**Configured in tsconfig.json:**
- `@/*` → `src/*`
- `@Modules/*` → `src/modules/*`
- `@Common/*` → `src/common/*`
- `@Config/*` → `src/config/*`
- `@Database/*` → `src/database/*`
- `@Guards/*` → `src/common/guards/*`
- `@Decorators/*` → `src/common/decorators/*`
- `@Interceptors/*` → `src/common/interceptors/*`
- `@Filters/*` → `src/common/filters/*`
- `@Exceptions/*` → `src/common/exceptions/*`
- `@Interfaces/*` → `src/common/interfaces/*`
- `@Base/*` → `src/common/base/*`
- `@Constants/*` → `src/common/constants/*`

**Usage:**
```typescript
import { BaseRepository } from '@Base/base.repository';
import { UserModule } from '@Modules/user/user.module';
import { AuthGuard } from '@Guards/auth.guard';
```

## Import Organization Pattern

**Observed Order:**
1. NestJS core imports (`@nestjs/*`)
2. Third-party libraries
3. Internal imports với path aliases
4. Relative imports (same module)

**Example:**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { ApiError } from '@Exceptions/api-error';
import { LoginDto } from '../dto/login.dto';
```

---

*Phân tích structure: 2026-05-03*
