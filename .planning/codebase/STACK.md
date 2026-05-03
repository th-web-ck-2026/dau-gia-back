# Technology Stack

**Ngày phân tích:** 2026-05-03

## Ngôn ngữ lập trình

**Chính:**
- TypeScript (target ES2024) - Toàn bộ codebase backend

**Phụ:**
- JavaScript - Các file build output trong `dist/`

## Runtime

**Môi trường:**
- Node.js (phiên bản không được chỉ định rõ trong package.json)

**Package Manager:**
- npm hoặc yarn
- Lockfile: Không phát hiện trong root directory

## Framework

**Core:**
- NestJS 11.1.3 - Framework backend chính
  - `@nestjs/common` 11.1.3
  - `@nestjs/core` 11.1.3
  - `@nestjs/platform-express` 11.1.3

**Database:**
- Sequelize 6.37.7 - ORM
- sequelize-typescript 2.1.6 - TypeScript decorators cho Sequelize
- `@nestjs/sequelize` 11.0.0 - NestJS integration
- pg 8.16.0 - PostgreSQL driver

**Authentication:**
- `@nestjs/jwt` 11.0.0 - JWT token management
- `@nestjs/passport` 11.0.5 - Authentication middleware
- passport 0.7.0 - Authentication strategies
- passport-jwt 4.0.1 - JWT strategy
- passport-custom 1.1.1 - Custom strategies
- bcrypt 6.0.0 - Password hashing

**API Documentation:**
- `@nestjs/swagger` 11.2.0 - OpenAPI/Swagger documentation

**Email:**
- `@nestjs-modules/mailer` 2.0.2 - Email module
- handlebars 4.7.8 - Email template engine

**Validation:**
- class-validator 0.14.2 - DTO validation
- class-transformer 0.5.1 - Object transformation

**Rate Limiting:**
- `@nestjs/throttler` 6.4.0 - Request throttling

**Testing:**
- Jest 29.7.0 - Test framework
- ts-jest 29.2.5 - TypeScript support cho Jest
- supertest 7.0.0 - HTTP assertions
- `@nestjs/testing` 11.0.1 - NestJS testing utilities
- `@faker-js/faker` 9.9.0 - Test data generation

**Build/Dev:**
- TypeScript 5.7.3 - Compiler
- `@nestjs/cli` 11.0.0 - NestJS CLI
- ts-node 10.9.2 - TypeScript execution
- ts-loader 9.5.2 - Webpack TypeScript loader
- `@swc/core` 1.10.7 - Fast TypeScript/JavaScript compiler
- `@swc/cli` 0.6.0 - SWC command line

**Code Quality:**
- ESLint 9.18.0 - Linting
- Prettier 3.4.2 - Code formatting
- typescript-eslint 8.20.0 - TypeScript ESLint rules

## Dependencies quan trọng

**Critical:**
- `@nestjs/config` 4.0.2 - Configuration management
- reflect-metadata 0.2.2 - Metadata reflection (required by NestJS)
- rxjs 7.8.1 - Reactive programming (required by NestJS)

**External Services:**
- `@payos/node` 1.0.10 - PayOS payment gateway integration
- `@nestlab/google-recaptcha` 3.10.0 - Google reCAPTCHA validation
- openai 5.10.1 - OpenAI API client
- hanhchinhvn 1.6.0 - Vietnamese administrative divisions data

**File Handling:**
- `@types/multer` 2.0.0 - File upload type definitions

## Configuration

**Environment:**
- Sử dụng `@nestjs/config` với file `.env`
- Config được load qua `appConfig` trong `src/config/app.config.ts`
- Các biến môi trường quan trọng:
  - `PORT` - Server port
  - `NODE_ENV` - Environment mode
  - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` - Database
  - `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` - JWT
  - `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` - PayOS
  - `FILE_API_KEY`, `FILE_API_PRIVATE_KEY` - File service
  - `PLATFORM_NAME`, `PLATFORM_URL`, `PLATFORM_LOGO_URL` - Platform info

**Build:**
- `tsconfig.json` - TypeScript compiler config
- `nest-cli.json` - NestJS CLI config
- `.prettierrc` - Code formatting rules
- ESLint config files

## Yêu cầu Platform

**Development:**
- Node.js runtime
- PostgreSQL database
- TypeScript 5.7.3+

**Production:**
- Node.js runtime
- PostgreSQL database
- Deployment target: Không được chỉ định rõ (có thể là bất kỳ platform nào hỗ trợ Node.js)

---

*Phân tích stack: 2026-05-03*
