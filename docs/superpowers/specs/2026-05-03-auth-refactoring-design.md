# Auth Module Refactoring - Design Document

**Ngày:** 2026-05-03  
**Tác giả:** Claude (Kiro AI)  
**Trạng thái:** Approved

## Tổng Quan

Refactor module authentication để tách biệt auth credentials khỏi user profile, hỗ trợ nhiều phương thức đăng nhập (email/password, Google OAuth), và multi-device sessions với token rotation.

## Mục Tiêu

1. **Tách biệt concerns:** User profile vs Authentication credentials vs Sessions
2. **Multi-provider support:** Email/password và Google OAuth (dễ mở rộng cho providers khác)
3. **Account linking:** Tự động link Google account với existing email
4. **Multi-device sessions:** Mỗi device có refresh token riêng
5. **Security improvements:** Hash refresh tokens, token rotation, device tracking
6. **Flexible password management:** User chọn logout other devices khi đổi password

## Kiến Trúc

### Database Schema

#### AuthProvider Model
Lưu credentials cho mỗi phương thức đăng nhập.

```typescript
{
  _id: string (UUID)
  userId: string (FK -> users._id)
  provider: 'email' | 'google'
  providerId: string // email hoặc google sub
  credentials: string | null // hashed password cho email, null cho google
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `(userId, provider)` - composite unique
- `(provider, providerId)` - composite unique

**Relationships:**
- 1 User có nhiều AuthProviders (email + google)
- 1 AuthProvider thuộc 1 User

#### AuthSession Model
Lưu refresh tokens và device information.

```typescript
{
  _id: string (UUID)
  userId: string (FK -> users._id)
  refreshToken: string // hashed với SHA-256
  deviceInfo: {
    userAgent: string
    browser: string
    os: string
    device: string
  }
  ipAddress: string
  location: {
    country: string
    city: string
  } | null // optional, có thể thêm sau
  expiresAt: Date
  lastActiveAt: Date
  createdAt: Date
}
```

**Indexes:**
- `(userId)` - để query sessions của user
- `(refreshToken)` - unique, để verify token
- `(expiresAt)` - để cleanup expired sessions

**Relationships:**
- 1 User có nhiều AuthSessions (multi-device)
- 1 AuthSession thuộc 1 User

#### User Model (Updated)
Chỉ giữ profile information, xóa auth-related fields.

```typescript
{
  _id: string
  fullname: string
  email: string (unique)
  phone: string (unique)
  avatar: string
  role: UserRoles
  birthday?: string
  gender?: Gender
  provinceId?: string
  districtId?: string
  wardId?: string
  address?: string
  isVerified?: boolean
  userStatus?: UserStatus
  verifyScore?: number
  
  // REMOVED: password, refreshToken
}
```

### Service Layer Architecture

```
AuthController
  ↓
AuthService (orchestration)
  ├→ AuthProviderService → AuthProviderRepository
  ├→ AuthSessionService → AuthSessionRepository
  ├→ UserRepository (existing)
  └→ SendMailService (existing)
```

#### AuthService
Main orchestration layer cho auth flows.

**Public Methods:**
- `login(provider, credentials, request)` - Unified login endpoint
- `register(registerDto)` - Tạo user mới với email/password
- `refresh(refreshToken)` - Refresh access token với rotation
- `logout(refreshToken)` - Logout device hiện tại
- `logoutAll(userId, exceptSessionId?)` - Logout tất cả devices
- `changePassword(userId, oldPassword, newPassword, logoutOtherDevices)` - Đổi password
- `forgotPassword(email)` - Gửi email reset password
- `resetPassword(token, newPassword)` - Reset password bằng token

**Private Methods:**
- `handleEmailLogin(email, password, request)` - Xử lý email login
- `handleGoogleLogin(idToken, request)` - Xử lý Google OAuth
- `createUserSession(userId, refreshToken, request)` - Tạo session mới
- `generateAccessToken(user)` - Tạo JWT access token
- `generateRefreshToken()` - Tạo refresh token

#### AuthProviderService
Quản lý authentication providers và credentials.

**Methods:**
- `createProvider(userId, provider, providerId, credentials?)` - Tạo provider mới
- `findByProvider(provider, providerId)` - Tìm provider
- `findByUserId(userId)` - Lấy tất cả providers của user
- `updateCredentials(providerId, newCredentials)` - Update password
- `verifyEmailPassword(email, password)` - Verify email/password
- `verifyGoogleToken(idToken)` - Verify Google ID token
- `linkProvider(userId, provider, providerId, credentials?)` - Link provider mới
- `unlinkProvider(userId, provider)` - Unlink provider

#### AuthSessionService
Quản lý sessions và refresh tokens.

**Methods:**
- `createSession(userId, refreshToken, deviceInfo, ipAddress)` - Tạo session
- `findByRefreshToken(hashedToken)` - Tìm session theo token
- `findByUserId(userId)` - Lấy tất cả sessions của user
- `deleteSession(sessionId)` - Xóa 1 session
- `deleteAllSessions(userId, exceptSessionId?)` - Xóa tất cả sessions
- `rotateToken(oldSessionId, newRefreshToken)` - Token rotation
- `cleanupExpiredSessions()` - Cleanup expired sessions
- `extractDeviceInfo(userAgent)` - Parse User-Agent header
- `extractIpAddress(request)` - Extract IP từ request

## Authentication Flows

### Email/Password Login

```
POST /auth/login?provider=email
Body: { email, password }

Flow:
1. Validate input (email, password required)
2. AuthProviderService.verifyEmailPassword(email, password)
   - Tìm AuthProvider (provider='email', providerId=email)
   - Verify password với bcrypt
3. Check user status (blocked?)
4. Extract device info từ User-Agent header
5. Extract IP từ X-Forwarded-For hoặc req.ip
6. Generate access token (JWT, 1 hour)
7. Generate refresh token (UUID)
8. AuthSessionService.createSession(userId, hashedRefreshToken, deviceInfo, ip)
9. Return { access_token, refresh_token, user }
```

### Google OAuth Login

```
POST /auth/login?provider=google
Body: { idToken }

Flow:
1. Validate input (idToken required)
2. AuthProviderService.verifyGoogleToken(idToken)
   - Verify với Google API
   - Extract email, googleSub, name, avatar
3. Tìm AuthProvider (provider='google', providerId=googleSub)
4. Nếu không tìm thấy:
   a. Tìm User theo email
   b. Nếu có User: link provider mới (account linking)
   c. Nếu không có: tạo User mới + AuthProvider
5. Extract device info + IP
6. Generate tokens
7. Create session
8. Return { access_token, refresh_token, user }
```

### Register

```
POST /auth/register
Body: { email, phone, password, fullname, role? }

Flow:
1. Validate input
2. Check email/phone đã tồn tại
3. Hash password với bcrypt (salt rounds = 10)
4. Create User
5. Create AuthProvider (provider='email', credentials=hashedPassword)
6. Return user info (không tự động login)
```

### Refresh Token

```
POST /auth/refresh
Body: { refreshToken }

Flow:
1. Hash refreshToken với SHA-256
2. AuthSessionService.findByRefreshToken(hashedToken)
3. Verify JWT signature
4. Check expiry
5. Token rotation:
   - Delete old session
   - Generate new refresh token
   - Create new session
   - Update lastActiveAt
6. Generate new access token
7. Return { access_token, refresh_token }
```

### Logout

```
POST /auth/logout
Body: { refreshToken }

Flow:
1. Hash refreshToken
2. Find session
3. Delete session
4. Return 200 OK

POST /auth/logout-all
Headers: Authorization (access token)

Flow:
1. Extract userId từ JWT
2. AuthSessionService.deleteAllSessions(userId)
3. Return 200 OK
```

### Change Password

```
POST /auth/change-password
Body: { oldPassword, newPassword, logoutOtherDevices: boolean }

Flow:
1. Extract userId từ JWT
2. Verify oldPassword
3. Hash newPassword
4. AuthProviderService.updateCredentials(userId, hashedPassword)
5. Nếu logoutOtherDevices = true:
   - Get current session ID từ refresh token
   - Delete all sessions except current
6. Return { message }
```

## API Endpoints

### Public Endpoints

```typescript
POST /auth/register
Body: { email, phone, password, fullname, role? }
Response: { user }

POST /auth/login?provider=email
Body: { email, password }
Response: { access_token, refresh_token, user }

POST /auth/login?provider=google
Body: { idToken }
Response: { access_token, refresh_token, user }

POST /auth/refresh
Body: { refreshToken }
Response: { access_token, refresh_token }

POST /auth/forgot-password
Body: { email }
Response: { message }
Rate limit: 1 request / 60 seconds

POST /auth/reset-password
Body: { token, newPassword }
Response: { message }
```

### Protected Endpoints

```typescript
POST /auth/logout
Body: { refreshToken }
Response: { message }

POST /auth/logout-all
Response: { message }

POST /auth/change-password
Body: { oldPassword, newPassword, logoutOtherDevices: boolean }
Response: { message }

GET /auth/me
Response: { user }
```

## Security

### Password Security
- **Hashing:** bcrypt với salt rounds = 10
- **Validation:** Minimum 8 characters
- **Change password:** Option để logout other devices

### Token Security
- **Access Token:** JWT, 1 hour expiry, payload: { sub, email, role, fullname, avatar }
- **Refresh Token:** UUID, 365 days expiry
- **Storage:** Refresh tokens hashed với SHA-256 trước khi lưu DB
- **Rotation:** Mỗi lần refresh tạo token mới, invalidate token cũ
- **Reuse Detection:** Token cũ không thể reuse sau rotation

### Rate Limiting
- **Login:** 5 attempts / 15 minutes per IP
- **Register:** 3 attempts / hour per IP
- **Refresh:** 10 attempts / minute per IP
- **Forgot password:** 1 request / 60 seconds (existing)

### Google OAuth Security
- Verify token với Google API
- Check token audience matches client ID
- Check token issuer (accounts.google.com)
- Extract verified email only

### Session Security
- Device fingerprinting từ User-Agent
- IP tracking
- Automatic cleanup của expired sessions
- Multi-device support với independent sessions

## Error Handling

### Login Errors
- `400` Missing provider query param
- `400` Invalid provider (not email|google)
- `400` Missing required fields (email/password hoặc idToken)
- `401` Invalid credentials
- `401` Invalid Google token
- `403` Account blocked

### Register Errors
- `400` Validation errors (weak password, invalid email)
- `409` Email or phone already exists

### Refresh Errors
- `401` Invalid or expired refresh token
- `401` Session not found

### Change Password Errors
- `400` Validation errors
- `401` Invalid old password

## Testing Strategy

### Unit Tests

**AuthService:**
- Login email/password success
- Login Google success
- Login failures (wrong password, blocked user)
- Register success/failures
- Refresh token with rotation
- Change password with logout options
- Account linking scenarios

**AuthProviderService:**
- Create/find providers
- Verify credentials
- Google token verification
- Link/unlink providers

**AuthSessionService:**
- Create session with device extraction
- Token rotation
- Delete sessions
- Cleanup expired

### Integration Tests

**E2E Flows:**
- Register → Login → Access protected route
- Login → Refresh → Access protected route
- Multi-device login → Logout one → Others work
- Change password → Logout other devices
- Google login new user → Creates all records
- Google login existing email → Links provider

**Security Tests:**
- Token reuse prevention
- Expired token rejection
- Invalid Google token rejection
- Rate limiting enforcement

## Breaking Changes

### API Changes
- `/auth/login` giờ cần query param `?provider=email` hoặc `?provider=google`
- `/auth/refresh` body format mới: `{ refreshToken }` (thay vì trong LoginDto)
- Response format giữ nguyên (ResponseInterceptor)

### Database Changes
- User model: xóa `password`, `refreshToken` columns
- Thêm 2 tables mới: `auth_providers`, `auth_sessions`

## Migration Notes

**Scope:** Design này không bao gồm migration scripts.

**Future Migration Considerations:**
- Cần migrate existing passwords từ users → auth_providers
- Cần migrate existing refresh tokens → auth_sessions (nếu có)
- Cần verify data integrity sau migration
- Cần backup database trước khi migrate

## Future Enhancements

### Phase 2 (Optional)
- Session management UI (list devices, revoke access)
- IP geolocation integration (MaxMind GeoLite2)
- More OAuth providers (Facebook, GitHub, Apple)
- SSO support (SAML, LDAP)
- 2FA/MFA support
- Login history tracking
- Suspicious activity detection

### Performance Optimizations
- Redis caching cho sessions
- Database connection pooling
- Batch cleanup expired sessions

## Dependencies

### New Dependencies
- `google-auth-library` - Verify Google ID tokens
- `ua-parser-js` - Parse User-Agent strings

### Existing Dependencies (Keep)
- `@nestjs/jwt` - JWT operations
- `@nestjs/passport` - Authentication strategies
- `bcrypt` - Password hashing
- `sequelize-typescript` - ORM

## Acceptance Criteria

- [ ] AuthProvider model created với proper indexes
- [ ] AuthSession model created với proper indexes
- [ ] User model updated (remove password, refreshToken)
- [ ] AuthProviderService implemented với all methods
- [ ] AuthSessionService implemented với all methods
- [ ] AuthService refactored để dùng new services
- [ ] Email/password login works với multi-device sessions
- [ ] Google OAuth login works với account linking
- [ ] Refresh token rotation works correctly
- [ ] Logout và logout-all work correctly
- [ ] Change password với logout options works
- [ ] Rate limiting configured cho all endpoints
- [ ] Unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] API documentation updated (Swagger)
- [ ] Security review passed

---

**Approved by:** User  
**Next Step:** Create implementation plan với writing-plans skill
