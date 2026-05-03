# External Integrations

**Ngày phân tích:** 2026-05-03

## APIs & External Services

**Payment Gateway:**
- PayOS - Cổng thanh toán
  - SDK/Client: `@payos/node` 1.0.10
  - Auth: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`
  - Config: `src/config/app.config.ts` (payos section)

**AI Services:**
- OpenAI - AI/ML capabilities
  - SDK/Client: `openai` 5.10.1
  - Auth: Không được chỉ định trong config (có thể qua env var riêng)
  - Usage: Chưa phát hiện implementation cụ thể trong codebase

**Security:**
- Google reCAPTCHA - Bot protection
  - SDK/Client: `@nestlab/google-recaptcha` 3.10.0
  - Implementation: `src/modules/recaptcha/strategy/recaptcha.strategy.ts`
  - Module: `src/modules/recaptcha/recaptcha.module.ts`

**Geographic Data:**
- hanhchinhvn - Vietnamese administrative divisions
  - Package: `hanhchinhvn` 1.6.0
  - Purpose: Cung cấp dữ liệu tỉnh/thành, quận/huyện, phường/xã Việt Nam
  - Usage: Chưa phát hiện implementation cụ thể

**File Storage:**
- Custom File Service
  - Auth: `FILE_API_KEY`, `FILE_API_PRIVATE_KEY`
  - Config: `src/config/app.config.ts` (file section)
  - Module: `src/modules/file/file.module.ts`
  - Service: `src/modules/file/services/file.service.ts`

## Data Storage

**Databases:**
- PostgreSQL
  - Connection: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
  - Client: Sequelize ORM 6.37.7 với sequelize-typescript 2.1.6
  - Driver: pg 8.16.0
  - Config: `src/config/database.config.ts`
  - Module: `src/database/database.module.ts`
  - Features:
    - Auto-load models
    - Auto-sync (configurable via `DB_SYNC`)
    - Alter tables on sync
    - Logging in development mode

**File Storage:**
- External File Service (qua API)
  - Không sử dụng local filesystem storage
  - Tích hợp qua custom file service API

**Caching:**
- Không phát hiện Redis hoặc caching layer
- Có thể sử dụng in-memory caching (không được config rõ ràng)

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication
  - Implementation: `src/modules/auth/`
  - Strategy: JWT với Passport
    - `src/modules/auth/strategies/jwt.strategy.ts`
  - Guards:
    - `src/common/guards/auth.guard.ts` - JWT authentication
    - `src/common/guards/role.guard.ts` - Role-based authorization
  - Features:
    - Access token + Refresh token
    - Password reset via email
    - bcrypt password hashing
    - Role-based access control

## Email Services

**Email Provider:**
- Custom SMTP configuration (multi-transporter)
  - Implementation: `src/modules/send-mail/services/send-mail.service.ts`
  - Config storage: Database (MailConfig model)
  - Module: `src/modules/mail-config/`
  - Features:
    - Multiple SMTP servers support
    - Round-robin transporter selection
    - Automatic failover
    - Gmail support
    - Handlebars template engine
  - Templates location: `src/modules/send-mail/templates/*.hbs`
  - Use cases:
    - Welcome email
    - Password reset email

**Platform Configuration:**
- `PLATFORM_NAME` - Tên nền tảng
- `PLATFORM_URL` - URL nền tảng
- `PLATFORM_LOGO_URL` - Logo URL
- `PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES` - Token expiry

## Monitoring & Observability

**Error Tracking:**
- Built-in NestJS Logger
  - Implementation: `src/common/filters/http-exception.filter.ts`
  - Logs tất cả HTTP exceptions với stack trace

**Logs:**
- Console logging
- NestJS Logger service
- Sequelize query logging (development mode only)

**External Monitoring:**
- Không phát hiện Sentry, DataDog, hoặc monitoring service khác

## CI/CD & Deployment

**Hosting:**
- Không được chỉ định rõ
- Có `.dockerignore` file (có thể sử dụng Docker)

**CI Pipeline:**
- Không phát hiện GitHub Actions, GitLab CI, hoặc CI config files

**Deployment:**
- Build command: `npm run build`
- Production start: `npm run start:prod`
- Output: `dist/` directory

## Environment Configuration

**Required env vars:**

**Database:**
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SYNC` (optional, default: false)

**Application:**
- `PORT` (optional, default: 3000)
- `NODE_ENV` (optional, default: development)
- `APP_NAME` (optional)

**JWT:**
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (optional, default: 1h)
- `JWT_REFRESH_EXPIRES_IN` (optional, default: 365d)

**PayOS:**
- `PAYOS_CLIENT_ID`
- `PAYOS_API_KEY`
- `PAYOS_CHECKSUM_KEY`

**File Service:**
- `FILE_API_KEY`
- `FILE_API_PRIVATE_KEY`

**Email:**
- `PLATFORM_NAME`
- `PLATFORM_URL`
- `PLATFORM_LOGO_URL`
- `PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES`

**Secrets location:**
- `.env` file (not committed to git)
- Có `.env` trong `.gitignore`

## Webhooks & Callbacks

**Incoming:**
- Không phát hiện webhook endpoints rõ ràng
- Có thể có trong PayOS integration (chưa implement)

**Outgoing:**
- Email notifications (password reset, welcome)
- Không phát hiện webhook calls đến external services

## Rate Limiting & Security

**Rate Limiting:**
- `@nestjs/throttler` 6.4.0
  - Global config: 10 requests per 10 seconds
  - Custom throttle: Auth forgot-password (1 request per 60 seconds)
  - Implementation: `src/app.module.ts`

**CORS:**
- Enabled với origin: '*' (allow all)
- Methods: GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS
- Credentials: true
- Config: `src/main.ts`

**Validation:**
- Global ValidationPipe
  - whitelist: true
  - forbidNonWhitelisted: true
  - transform: true
  - Config: `src/main.ts`

---

*Phân tích integrations: 2026-05-03*
