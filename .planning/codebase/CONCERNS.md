# Các Vấn Đề Kỹ Thuật Codebase

**Ngày phân tích:** 2026-05-03

## Bảo Mật

**CORS được cấu hình quá rộng:**
- Vấn đề: CORS cho phép tất cả origins (`origin: '*'`) và credentials
- Files: `src/main.ts:22-26`
- Rủi ro: Cho phép bất kỳ domain nào gọi API, dễ bị tấn công CSRF và data theft
- Khuyến nghị: Giới hạn origins cụ thể từ environment variables
```typescript
// Hiện tại (không an toàn)
app.enableCors({
  origin: '*',
  credentials: true,
});

// Nên sửa thành
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});
```

**Refresh token được lưu trong database dạng plain text:**
- Vấn đề: Refresh token không được hash trước khi lưu vào database
- Files: `src/modules/auth/services/auth.service.ts:79-83`, `src/modules/user/models/user.model.ts:62`
- Rủi ro: Nếu database bị breach, attacker có thể sử dụng refresh token để tạo access token mới
- Khuyến nghị: Hash refresh token trước khi lưu, hoặc sử dụng token rotation strategy

**TypeScript strict mode bị tắt:**
- Vấn đề: `noImplicitAny: false`, `strictNullChecks: false` trong tsconfig
- Files: `tsconfig.json:15-16`
- Rủi ro: Cho phép type any và null/undefined không được kiểm tra, dễ gây runtime errors
- Khuyến nghị: Bật strict mode và fix các type errors dần dần

**Thiếu rate limiting cho sensitive endpoints:**
- Vấn đề: Global throttle (10 requests/10s) quá rộng, không có rate limit riêng cho login/register
- Files: `src/app.module.ts:26-33`
- Rủi ro: Dễ bị brute force attack trên login endpoint
- Khuyến nghị: Thêm rate limit nghiêm ngặt hơn cho auth endpoints (3-5 attempts/minute)

**Password reset token không có blacklist:**
- Vấn đề: Token reset password có thể được sử dụng nhiều lần trong thời gian valid
- Files: `src/modules/auth/services/auth.service.ts:166-179`
- Rủi ro: Nếu token bị leak, attacker có thể reset password nhiều lần
- Khuyến nghị: Invalidate token sau khi sử dụng hoặc lưu token đã dùng vào blacklist

**Thiếu input sanitization cho file uploads:**
- Vấn đề: Không kiểm tra file type, size, hoặc content trước khi upload
- Files: `src/modules/file/services/file.service.ts:19-53`
- Rủi ro: Có thể upload malicious files (executable, scripts)
- Khuyến nghị: Validate file type, size limit, và scan virus trước khi upload

**Database sync.alter = true trong production:**
- Vấn đề: `sync: { alter: true }` có thể thay đổi schema tự động
- Files: `src/config/database.config.ts:21-23`
- Rủi ro: Có thể mất dữ liệu hoặc thay đổi schema không mong muốn trong production
- Khuyến nghị: Chỉ enable trong development, sử dụng migrations cho production

**Thiếu validation cho environment variables:**
- Vấn đề: Không validate env vars khi khởi động, sử dụng default values không an toàn
- Files: `src/config/app.config.ts:2-17`
- Rủi ro: App có thể chạy với config không đúng mà không báo lỗi
- Khuyến nghị: Sử dụng class-validator để validate env vars, throw error nếu thiếu

## Hiệu Năng

**N+1 query problem trong relationships:**
- Vấn đề: Không có eager loading strategy rõ ràng cho Sequelize relationships
- Files: `src/common/base/base.repository.ts:19-22`
- Nguyên nhân: Mỗi lần query có thể trigger thêm queries cho relations
- Cải thiện: Sử dụng `include` option một cách có chủ đích, implement dataloader pattern

**Thiếu database indexing strategy:**
- Vấn đề: Không thấy index definitions trong models ngoài unique constraints
- Files: `src/modules/user/models/user.model.ts`, `src/modules/notification/models/notification.model.ts`
- Nguyên nhân: Queries trên các field thường xuyên (email, phone, status) có thể chậm
- Cải thiện: Thêm indexes cho các fields được query thường xuyên

**Mail service load configs mỗi lần gửi email:**
- Vấn đề: `loadMailConfigs()` được gọi trong mỗi `sendMail()` call
- Files: `src/modules/send-mail/services/send-mail.service.ts:106`
- Nguyên nhân: Query database mỗi lần gửi email thay vì cache
- Cải thiện: Cache mail configs và chỉ reload khi có thay đổi

**Thiếu pagination limit:**
- Vấn đề: Không có max limit cho pagination, user có thể request limit=999999
- Files: `src/common/base/base.repository.ts:24-52`
- Nguyên nhân: Có thể query toàn bộ database trong 1 request
- Cải thiện: Enforce max limit (ví dụ: 100 items/page)

**File upload sử dụng buffer trong memory:**
- Vấn đề: File được load toàn bộ vào memory trước khi upload
- Files: `src/modules/file/services/file.service.ts:27-29`
- Nguyên nhân: Với file lớn có thể gây memory leak
- Cải thiện: Sử dụng streaming upload cho files lớn

## Chất Lượng Code

**Sử dụng type `any` quá nhiều:**
- Vấn đề: 57 instances của type `any` trong codebase
- Files: `src/common/decorators/request-condition.decotator.ts:39`, `src/common/base/base.repository.ts:65,71,78,85`, `src/common/base/base.service.ts:16,20,30,34,43`
- Tác động: Mất type safety, khó debug và maintain
- Cách sửa: Định nghĩa proper types/interfaces cho từng use case

**File quá lớn và phức tạp:**
- Vấn đề: `request-condition.decorator.ts` có 213 lines với logic phức tạp
- Files: `src/common/decorators/request-condition.decotator.ts`
- Tác động: Khó đọc, test và maintain
- Cách sửa: Tách thành nhiều functions/classes nhỏ hơn, extract validation logic

**Inconsistent error handling:**
- Vấn đề: Một số nơi throw error trực tiếp, một số catch và re-throw
- Files: `src/modules/file/services/file.service.ts:49-51,96-98`
- Tác động: Khó trace errors và log consistently
- Cách sửa: Standardize error handling pattern, sử dụng global exception filter

**Console.log còn sót lại trong code:**
- Vấn đề: 11 instances của console.log/error/warn
- Files: `src/modules/file/services/file.service.ts:50,97`, `src/modules/notification/services/notification.service.ts:54`, `src/modules/recaptcha/strategy/recaptcha.strategy.ts:33`
- Tác động: Không có structured logging, khó monitor production
- Cách sửa: Thay thế bằng proper Logger service từ NestJS

**Commented code không được cleanup:**
- Vấn đề: Code bị comment out còn sót lại
- Files: `src/common/base/base.repository.ts:44`, `src/modules/user/controllers/user.controller.ts:27`, `src/main.ts:17`
- Tác động: Gây confusion và clutter
- Cách sửa: Xóa commented code, sử dụng git history nếu cần

**Thiếu JSDoc/TSDoc comments:**
- Vấn đề: Hầu hết functions không có documentation comments
- Files: Toàn bộ codebase
- Tác động: Khó hiểu business logic và API contracts
- Cách sửa: Thêm JSDoc cho public methods, đặc biệt là decorators và utilities

## Kiến Trúc

**Tight coupling giữa layers:**
- Vấn đề: Services trực tiếp sử dụng Repositories, không có abstraction layer
- Files: `src/modules/auth/services/auth.service.ts:16`, `src/modules/user/services/user.service.ts`
- Tác động: Khó test và thay đổi data layer
- Cải thiện: Implement repository pattern với interfaces

**Thiếu separation of concerns trong AuthService:**
- Vấn đề: AuthService xử lý cả authentication, token generation, và email sending
- Files: `src/modules/auth/services/auth.service.ts`
- Tác động: Service quá lớn (200 lines), vi phạm Single Responsibility Principle
- Cải thiện: Tách thành TokenService, AuthService, và sử dụng SendMailService properly

**Global exception filter quá generic:**
- Vấn đề: HttpExceptionFilter xử lý tất cả exceptions giống nhau
- Files: `src/common/filters/http-exception.filter.ts`
- Tác động: Mất thông tin chi tiết về errors, khó debug
- Cải thiện: Implement specific exception filters cho từng loại error

**Thiếu domain layer:**
- Vấn đề: Business logic nằm rải rác trong services và controllers
- Files: Toàn bộ modules
- Tác động: Khó reuse logic và maintain business rules
- Cải thiện: Implement domain entities với business methods

**Configuration management không tập trung:**
- Vấn đề: Một số nơi dùng ConfigService, một số dùng process.env trực tiếp
- Files: `src/modules/auth/services/auth.service.ts:157`, `src/modules/recaptcha/strategy/recaptcha.strategy.ts:10-11`
- Tác động: Inconsistent và khó manage configs
- Cải thiện: Luôn sử dụng ConfigService, không access process.env trực tiếp

## Thiếu Best Practices

**Không có health check endpoint:**
- Vấn đề: Có log "Health Check" nhưng không thấy implementation
- Files: `src/main.ts:39`
- Tác động: Không thể monitor app health trong production
- Cải thiện: Implement proper health check với @nestjs/terminus

**Thiếu request logging middleware:**
- Vấn đề: Không có middleware để log incoming requests
- Files: N/A
- Tác động: Khó debug và audit API calls
- Cải thiện: Thêm logging middleware với request ID, user info, và response time

**Không có API versioning:**
- Vấn đề: API không có version trong URL
- Files: `src/main.ts:29`
- Tác động: Khó maintain backward compatibility khi thay đổi API
- Cải thiện: Implement versioning strategy (URL hoặc header-based)

**Thiếu request validation cho query parameters:**
- Vấn đề: Query params không được validate bằng class-validator
- Files: `src/common/decorators/request-query.decorator.ts`
- Tác động: Có thể nhận invalid data từ query string
- Cải thiện: Tạo DTO classes cho query params và validate

**Password complexity không được enforce:**
- Vấn đề: Chỉ check MinLength(8), không check complexity
- Files: `src/modules/auth/dto/login.dto.ts:17`, `src/modules/auth/dto/register.dto.ts`
- Tác động: Users có thể dùng weak passwords
- Cải thiện: Thêm validation cho uppercase, lowercase, numbers, special chars

**Thiếu audit logging:**
- Vấn đề: Không có logging cho sensitive operations (password change, role change)
- Files: `src/modules/user/services/user.service.ts`
- Tác động: Không thể audit security events
- Cải thiện: Implement audit log cho tất cả sensitive operations

## Nợ Kỹ Thuật

**Database migrations không được sử dụng:**
- Vấn đề: Sử dụng sync/alter thay vì migrations
- Files: `src/config/database.config.ts:20-23`
- Tác động: Không có version control cho database schema
- Cách giải quyết: Setup Sequelize migrations và tạo migration files cho existing schema

**Thiếu transaction management:**
- Vấn đề: Không thấy transaction được sử dụng cho multi-step operations
- Files: `src/modules/auth/services/auth.service.ts:22-40`
- Tác động: Có thể có inconsistent data nếu operation fails giữa chừng
- Cách giải quyết: Wrap multi-step operations trong transactions

**Hard-coded URLs trong code:**
- Vấn đề: API URLs được hard-code thay vì config
- Files: `src/modules/file/services/file.service.ts:13,16`, `src/modules/send-mail/services/send-mail.service.ts:149`
- Tác động: Khó thay đổi và test
- Cách giải quyết: Move tất cả URLs vào environment variables

**Thiếu retry mechanism cho external API calls:**
- Vấn đề: Calls đến external APIs (file upload, email) không có retry
- Files: `src/modules/file/services/file.service.ts:32-42`, `src/modules/send-mail/services/send-mail.service.ts:122-129`
- Tác động: Transient failures gây lỗi permanent
- Cách giải quyết: Implement exponential backoff retry với circuit breaker

**Email templates hard-coded:**
- Vấn đề: Template names và paths hard-coded trong service
- Files: `src/modules/send-mail/services/send-mail.service.ts:150,184`
- Tác động: Khó manage và version templates
- Cách giải quyết: Implement template registry với versioning

## Vấn Đề Dependencies

**Bcrypt version 6.0.0 có breaking changes:**
- Vấn đề: Bcrypt v6 có thể có compatibility issues
- Files: `package.json:37`
- Tác động: Có thể gây lỗi với existing hashed passwords
- Khuyến nghị: Test thoroughly hoặc downgrade về v5.x nếu có issues

**Sequelize v6 đã deprecated một số features:**
- Vấn đề: Sequelize v6 không còn được maintain actively
- Files: `package.json:49`
- Tác động: Có thể thiếu security patches
- Khuyến nghị: Plan migration sang Sequelize v7 hoặc TypeORM

**Thiếu security audit cho dependencies:**
- Vấn đề: Không có npm audit trong CI/CD
- Files: N/A
- Tác động: Có thể sử dụng packages với known vulnerabilities
- Khuyến nghị: Thêm `npm audit` vào CI pipeline và fix vulnerabilities

## Thiếu Test Coverage

**Không có unit tests:**
- Vấn đề: Không tìm thấy file .spec.ts hoặc .test.ts nào
- Files: N/A
- Rủi ro: Không thể verify code correctness, dễ introduce bugs khi refactor
- Ưu tiên: High - Bắt đầu với critical paths (auth, payment)
- Cách thêm: Tạo .spec.ts files cho services và controllers, target 80% coverage

**Không có integration tests:**
- Vấn đề: Không có tests cho API endpoints
- Files: `test/` directory có thể empty
- Rủi ro: Không verify end-to-end flows hoạt động đúng
- Ưu tiên: High
- Cách thêm: Setup supertest cho API testing, test critical user flows

**Không có E2E tests:**
- Vấn đề: Không có automated testing cho user scenarios
- Files: N/A
- Rủi ro: Regression bugs không được phát hiện trước production
- Ưu tiên: Medium
- Cách thêm: Setup Playwright hoặc Cypress cho E2E testing

**Thiếu test cho edge cases:**
- Vấn đề: Các decorators phức tạp như RequestCondition không có tests
- Files: `src/common/decorators/request-condition.decotator.ts`
- Rủi ro: Complex logic dễ break khi modify
- Ưu tiên: High
- Cách thêm: Unit test cho tất cả operators và validation logic

## Thiếu Documentation

**API documentation không đầy đủ:**
- Vấn đề: Chỉ một số endpoints có @ApiOperation decorator
- Files: `src/modules/user/controllers/user.controller.ts`, `src/modules/auth/controllers/auth.controller.ts`
- Tác động: Frontend developers khó hiểu API contracts
- Cách cải thiện: Thêm Swagger decorators cho tất cả endpoints với examples

**README không reflect actual project:**
- Vấn đề: README vẫn là template mặc định của NestJS
- Files: `README.md`
- Tác động: New developers không biết cách setup và run project
- Cách cải thiện: Update với project-specific setup instructions, architecture overview

**Thiếu architecture documentation:**
- Vấn đề: Không có docs về system design và data flow
- Files: N/A
- Tác động: Khó onboard new developers
- Cách cải thiện: Tạo ARCHITECTURE.md với diagrams và explanations

**Environment variables không được document:**
- Vấn đề: Không có .env.example với descriptions
- Files: Có `simple.env` nhưng không rõ purpose
- Tác động: Developers không biết cần config gì
- Cách cải thiện: Tạo .env.example với comments cho từng variable

---

*Audit hoàn thành: 2026-05-03*
