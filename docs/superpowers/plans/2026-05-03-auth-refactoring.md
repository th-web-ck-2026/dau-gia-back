# Auth Module Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor auth module để tách AuthProvider và AuthSession models, hỗ trợ multi-provider login (email/password, Google OAuth) với multi-device sessions và token rotation.

**Architecture:** Tạo 2 models mới (AuthProvider, AuthSession), 2 services mới (AuthProviderService, AuthSessionService), refactor AuthService để orchestrate, update AuthController để hỗ trợ provider query param.

**Tech Stack:** NestJS, Sequelize, JWT, bcrypt, Google OAuth2, ua-parser-js, crypto

---

## Implementation Phases

**Phase 1:** Foundation (Tasks 1-4) - Dependencies, utilities, constants
**Phase 2:** Data Layer (Tasks 5-8) - Models, entities, repositories  
**Phase 3:** Service Layer (Tasks 9-12) - AuthProviderService, AuthSessionService
**Phase 4:** Auth Logic (Tasks 13-15) - Refactor AuthService, DTOs
**Phase 5:** API Layer (Task 16) - Update AuthController
**Phase 6:** User Model Cleanup (Task 17) - Remove auth fields
**Phase 7:** Module Integration (Task 18) - Wire everything together

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install required packages**

```bash
npm install ua-parser-js google-auth-library
npm install --save-dev @types/ua-parser-js
```

- [ ] **Step 2: Verify installation**

```bash
npm list ua-parser-js google-auth-library
```

Expected: Both packages listed

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add ua-parser-js and google-auth-library dependencies"
```

---

## Task 2: Create Auth Constants

**Files:**
- Create: `src/modules/auth/common/constants.ts`
- Modify: `src/common/constants/entity.constant.ts`

- [ ] **Step 1: Create auth constants**

Create `src/modules/auth/common/constants.ts`:

```typescript
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
}

export const AUTH_PROVIDER_VALUES = Object.values(AuthProvider);
```

- [ ] **Step 2: Update entity table constants**

Modify `src/common/constants/entity.constant.ts`:

```typescript
export const EntityTable = {
  USER: 'user',
  AUTH: 'auth',
  AUTH_PROVIDER: 'auth_provider',
  AUTH_SESSION: 'auth_session',
  NOTIFICATION: 'notification',
  MAIL_CONFIG: 'mail_config',
} as const;
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/auth/common/constants.ts src/common/constants/entity.constant.ts
git commit -m "feat: add auth provider constants and table names"
```

---

## Task 3: Create Crypto Utilities

**Files:**
- Create: `src/common/utils/crypto.util.ts`

- [ ] **Step 1: Create crypto utility**

Create `src/common/utils/crypto.util.ts`:

```typescript
import * as crypto from 'crypto';

/**
 * Hash a token using SHA-256
 * Used for hashing refresh tokens before storing in database
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify if a token matches a hash
 */
export function verifyHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return tokenHash === hash;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/common/utils/crypto.util.ts
git commit -m "feat: add crypto utilities for token hashing"
```

---

## Task 4: Create Device Parser Utility

**Files:**
- Create: `src/common/utils/device-parser.util.ts`

- [ ] **Step 1: Create device parser utility**

Create `src/common/utils/device-parser.util.ts`:

```typescript
import { UAParser } from 'ua-parser-js';
import { Request } from 'express';

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
}

export function parseDeviceInfo(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    userAgent,
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: result.device.type || 'desktop',
  };
}

export function extractIpAddress(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];
  
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }
  
  return request.ip || 'unknown';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/common/utils/device-parser.util.ts
git commit -m "feat: add device parser utility"
```

---
## Task 5: Create AuthProvider Entity & Model

**Files:**
- Create: `src/modules/auth/entities/auth-provider.entity.ts`
- Create: `src/modules/auth/models/auth-provider.model.ts`

- [ ] **Step 1: Create AuthProvider entity**

Create `src/modules/auth/entities/auth-provider.entity.ts`:

```typescript
import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { AuthProvider as AuthProviderEnum } from '../common/constants';

export interface AuthProvider extends BaseEntity {
  _id: string;
  userId: string;
  provider: AuthProviderEnum;
  providerId: string;
  credentials: string | null;
  isVerified: boolean;
}
```

- [ ] **Step 2: Create AuthProvider model**

Create `src/modules/auth/models/auth-provider.model.ts`:

```typescript
import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { AuthProvider as AuthProviderEntity } from '../entities/auth-provider.entity';
import { AuthProvider as AuthProviderEnum, AUTH_PROVIDER_VALUES } from '../common/constants';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.AUTH_PROVIDER,
  indexes: [
    { unique: true, fields: ['userId', 'provider'] },
    { unique: true, fields: ['provider', 'providerId'] },
  ],
})
export class AuthProviderModel extends Model implements AuthProviderEntity {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => UserModel)
  @Column({ allowNull: false })
  userId: string;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @Column({
    type: DataType.ENUM(...AUTH_PROVIDER_VALUES),
    allowNull: false,
  })
  provider: AuthProviderEnum;

  @Column({ allowNull: false })
  providerId: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  credentials: string | null;

  @Column({ defaultValue: false })
  isVerified: boolean;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/auth/entities/auth-provider.entity.ts src/modules/auth/models/auth-provider.model.ts
git commit -m "feat: create AuthProvider entity and model"
```

---

## Task 6: Create AuthSession Entity & Model

**Files:**
- Create: `src/modules/auth/entities/auth-session.entity.ts`
- Create: `src/modules/auth/models/auth-session.model.ts`

- [ ] **Step 1: Create AuthSession entity**

Create `src/modules/auth/entities/auth-session.entity.ts`:

```typescript
import { BaseEntity } from '@Common/interfaces/base-entity.interface';

export interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
}

export interface AuthSession extends BaseEntity {
  _id: string;
  userId: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  expiresAt: Date;
  lastActiveAt: Date;
}
```

- [ ] **Step 2: Create AuthSession model**

Create `src/modules/auth/models/auth-session.model.ts`:

```typescript
import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { AuthSession as AuthSessionEntity, DeviceInfo } from '../entities/auth-session.entity';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.AUTH_SESSION,
  indexes: [
    { fields: ['userId'] },
    { unique: true, fields: ['refreshToken'] },
    { fields: ['expiresAt'] },
  ],
})
export class AuthSessionModel extends Model implements AuthSessionEntity {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => UserModel)
  @Column({ allowNull: false })
  userId: string;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @Column({ allowNull: false, unique: true })
  refreshToken: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  deviceInfo: DeviceInfo;

  @Column({ allowNull: false })
  ipAddress: string;

  @Column({ allowNull: false })
  expiresAt: Date;

  @Column({ allowNull: false })
  lastActiveAt: Date;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/modules/auth/entities/auth-session.entity.ts src/modules/auth/models/auth-session.model.ts
git commit -m "feat: create AuthSession entity and model"
```

---

## Task 7: Create AuthProvider Repository

**Files:**
- Create: `src/modules/auth/repositories/auth-provider.repository.ts`

- [ ] **Step 1: Create repository**

Create `src/modules/auth/repositories/auth-provider.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '@Base/base.repository';
import { AuthProviderModel } from '../models/auth-provider.model';
import { AuthProvider as AuthProviderEnum } from '../common/constants';

@Injectable()
export class AuthProviderRepository extends BaseRepository<AuthProviderModel> {
  constructor(
    @InjectModel(AuthProviderModel)
    private authProviderModel: typeof AuthProviderModel,
  ) {
    super(authProviderModel);
  }

  async findByProvider(provider: AuthProviderEnum, providerId: string): Promise<AuthProviderModel | null> {
    return this.getOne({
      where: { provider, providerId },
      include: [{ association: 'user' }],
    });
  }

  async findByUserId(userId: string): Promise<AuthProviderModel[]> {
    return this.getAll({ where: { userId } });
  }

  async findByUserAndProvider(userId: string, provider: AuthProviderEnum): Promise<AuthProviderModel | null> {
    return this.getOne({ where: { userId, provider } });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/auth/repositories/auth-provider.repository.ts
git commit -m "feat: create AuthProvider repository"
```

---

## Task 8: Create AuthSession Repository

**Files:**
- Create: `src/modules/auth/repositories/auth-session.repository.ts`

- [ ] **Step 1: Create repository**

Create `src/modules/auth/repositories/auth-session.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository } from '@Base/base.repository';
import { AuthSessionModel } from '../models/auth-session.model';
import { Op } from 'sequelize';

@Injectable()
export class AuthSessionRepository extends BaseRepository<AuthSessionModel> {
  constructor(
    @InjectModel(AuthSessionModel)
    private authSessionModel: typeof AuthSessionModel,
  ) {
    super(authSessionModel);
  }

  async findByRefreshToken(hashedToken: string): Promise<AuthSessionModel | null> {
    return this.getOne({
      where: { refreshToken: hashedToken },
      include: [{ association: 'user' }],
    });
  }

  async findActiveByUserId(userId: string): Promise<AuthSessionModel[]> {
    return this.getAll({
      where: {
        userId,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
  }

  async deleteExpired(): Promise<number> {
    return this.authSessionModel.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() },
      },
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/auth/repositories/auth-session.repository.ts
git commit -m "feat: create AuthSession repository"
```

---

## Task 9: Create AuthProviderService

**Files:**
- Create: `src/modules/auth/services/auth-provider.service.ts`

- [ ] **Step 1: Create service with core methods**

Create `src/modules/auth/services/auth-provider.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthProviderRepository } from '../repositories/auth-provider.repository';
import { AuthProvider } from '../common/constants';
import * as bcrypt from 'bcrypt';
import { ApiError } from '@Exceptions/api-error';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthProviderService {
  private googleClient: OAuth2Client;

  constructor(
    private authProviderRepository: AuthProviderRepository,
    private configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(clientId);
  }

  async createProvider(userId: string, provider: AuthProvider, providerId: string, credentials?: string) {
    return this.authProviderRepository.create({
      userId,
      provider,
      providerId,
      credentials,
      isVerified: provider === AuthProvider.GOOGLE,
    });
  }

  async findByProvider(provider: AuthProvider, providerId: string) {
    return this.authProviderRepository.findByProvider(provider, providerId);
  }

  async updateCredentials(userId: string, provider: AuthProvider, newCredentials: string) {
    const authProvider = await this.authProviderRepository.findByUserAndProvider(userId, provider);
    if (!authProvider) {
      throw ApiError.NotFound('Auth provider not found');
    }
    const hashedPassword = await bcrypt.hash(newCredentials, 10);
    await this.authProviderRepository.updateOne(
      { credentials: hashedPassword },
      { where: { _id: authProvider._id } },
    );
  }

  async verifyEmailPassword(email: string, password: string) {
    const authProvider = await this.findByProvider(AuthProvider.EMAIL, email);
    if (!authProvider || !authProvider.credentials) {
      throw ApiError.Unauthorized('Invalid email or password');
    }
    const isValid = await bcrypt.compare(password, authProvider.credentials);
    if (!isValid) {
      throw ApiError.Unauthorized('Invalid email or password');
    }
    return authProvider.user;
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      return {
        googleSub: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      };
    } catch (error) {
      throw ApiError.Unauthorized('Invalid Google token');
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/auth/services/auth-provider.service.ts
git commit -m "feat: create AuthProviderService"
```

---

## Task 10: Create AuthSessionService

**Files:**
- Create: `src/modules/auth/services/auth-session.service.ts`

- [ ] **Step 1: Create service**

Create `src/modules/auth/services/auth-session.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthSessionRepository } from '../repositories/auth-session.repository';
import { hashToken } from '@/common/utils/crypto.util';
import { parseDeviceInfo, extractIpAddress } from '@/common/utils/device-parser.util';
import { Request } from 'express';
import { ApiError } from '@Exceptions/api-error';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthSessionService {
  constructor(
    private authSessionRepository: AuthSessionRepository,
    private configService: ConfigService,
  ) {}

  async createSession(userId: string, refreshToken: string, request: Request) {
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const deviceInfo = parseDeviceInfo(userAgent);
    const ipAddress = extractIpAddress(request);
    
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '365d';
    const expiresAt = this.calculateExpiry(refreshExpiresIn);

    return this.authSessionRepository.create({
      userId,
      refreshToken: hashToken(refreshToken),
      deviceInfo,
      ipAddress,
      expiresAt,
      lastActiveAt: new Date(),
    });
  }

  async findByRefreshToken(refreshToken: string) {
    const hashedToken = hashToken(refreshToken);
    return this.authSessionRepository.findByRefreshToken(hashedToken);
  }

  async rotateToken(oldSessionId: string, newRefreshToken: string) {
    await this.authSessionRepository.deleteOne({ where: { _id: oldSessionId } });
    // New session will be created by createSession
  }

  async deleteSession(refreshToken: string) {
    const hashedToken = hashToken(refreshToken);
    await this.authSessionRepository.deleteOne({ where: { refreshToken: hashedToken } });
  }

  async deleteAllSessions(userId: string, exceptSessionId?: string) {
    if (exceptSessionId) {
      await this.authSessionRepository.deleteMany({
        where: {
          userId,
          _id: { [Op.ne]: exceptSessionId },
        },
      });
    } else {
      await this.authSessionRepository.deleteMany({ where: { userId } });
    }
  }

  private calculateExpiry(expiresIn: string): Date {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    
    const [, value, unit] = match;
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return new Date(Date.now() + parseInt(value) * multipliers[unit]);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/auth/services/auth-session.service.ts
git commit -m "feat: create AuthSessionService"
```

---

## Task 11: Create New DTOs

**Files:**
- Create: `src/modules/auth/dto/google-login.dto.ts`
- Create: `src/modules/auth/dto/change-password.dto.ts`
- Modify: `src/modules/auth/dto/login.dto.ts`

- [ ] **Step 1: Create Google login DTO**

Create `src/modules/auth/dto/google-login.dto.ts`:

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;
}
```

- [ ] **Step 2: Create change password DTO**

Create `src/modules/auth/dto/change-password.dto.ts`:

```typescript
import { IsNotEmpty, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsOptional()
  @IsBoolean()
  logoutOtherDevices?: boolean;
}
```

- [ ] **Step 3: Update login DTO**

Modify `src/modules/auth/dto/login.dto.ts` to make fields optional:

```typescript
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  idToken?: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/auth/dto/
git commit -m "feat: create and update auth DTOs"
```

---

## Task 12: Refactor AuthService

**Files:**
- Modify: `src/modules/auth/services/auth.service.ts`

- [ ] **Step 1: Update imports and constructor**

Update imports and inject new services:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthProviderService } from './auth-provider.service';
import { AuthSessionService } from './auth-session.service';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { SendMailService } from '@/modules/send-mail/services/send-mail.service';
import { ApiError } from '@Exceptions/api-error';
import { AuthProvider } from '../common/constants';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private authProviderService: AuthProviderService,
    private authSessionService: AuthSessionService,
    private userRepository: UserRepository,
    private sendMailService: SendMailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  
  // ... methods will be added in next steps
}
```

- [ ] **Step 2: Implement login method**

Add login method that handles both providers:

```typescript
async login(provider: string, credentials: any, request: Request) {
  if (provider === AuthProvider.EMAIL) {
    return this.handleEmailLogin(credentials.email, credentials.password, request);
  } else if (provider === AuthProvider.GOOGLE) {
    return this.handleGoogleLogin(credentials.idToken, request);
  }
  throw ApiError.BadRequest('Invalid provider');
}

private async handleEmailLogin(email: string, password: string, request: Request) {
  const user = await this.authProviderService.verifyEmailPassword(email, password);
  
  if (user.userStatus === 'blocked') {
    throw ApiError.Forbidden('Account has been blocked');
  }

  const accessToken = this.generateAccessToken(user);
  const refreshToken = uuidv4();
  
  await this.authSessionService.createSession(user._id, refreshToken, request);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      avatar: user.avatar,
      role: user.role,
    },
  };
}

private async handleGoogleLogin(idToken: string, request: Request) {
  const googleData = await this.authProviderService.verifyGoogleToken(idToken);
  
  let authProvider = await this.authProviderService.findByProvider(
    AuthProvider.GOOGLE,
    googleData.googleSub,
  );

  let user;
  if (!authProvider) {
    user = await this.userRepository.findByEmail(googleData.email);
    
    if (user) {
      authProvider = await this.authProviderService.createProvider(
        user._id,
        AuthProvider.GOOGLE,
        googleData.googleSub,
      );
    } else {
      user = await this.userRepository.create({
        email: googleData.email,
        fullname: googleData.name,
        avatar: googleData.avatar,
        role: 'user',
        phone: '',
      });
      authProvider = await this.authProviderService.createProvider(
        user._id,
        AuthProvider.GOOGLE,
        googleData.googleSub,
      );
    }
  } else {
    user = authProvider.user;
  }

  const accessToken = this.generateAccessToken(user);
  const refreshToken = uuidv4();
  
  await this.authSessionService.createSession(user._id, refreshToken, request);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      avatar: user.avatar,
      role: user.role,
    },
  };
}
```

- [ ] **Step 3: Implement register, refresh, logout methods**

Add remaining methods:

```typescript
async register(registerDto: any) {
  const existingUser = await this.userRepository.getOne({
    where: {
      [Op.or]: [{ email: registerDto.email }, { phone: registerDto.phone }],
    },
  });
  
  if (existingUser) {
    throw ApiError.Conflict('Email or phone already exists');
  }

  const user = await this.userRepository.create({
    ...registerDto,
  });

  const hashedPassword = await bcrypt.hash(registerDto.password, 10);
  await this.authProviderService.createProvider(
    user._id,
    AuthProvider.EMAIL,
    registerDto.email,
    hashedPassword,
  );

  const { ...result } = user.toJSON();
  return result;
}

async refresh(refreshToken: string, request: Request) {
  const session = await this.authSessionService.findByRefreshToken(refreshToken);
  
  if (!session || session.expiresAt < new Date()) {
    throw ApiError.Unauthorized('Invalid or expired refresh token');
  }

  const user = await this.userRepository.getById(session.userId);
  if (!user) {
    throw ApiError.Unauthorized('User not found');
  }

  await this.authSessionService.rotateToken(session._id, refreshToken);

  const accessToken = this.generateAccessToken(user);
  const newRefreshToken = uuidv4();
  
  await this.authSessionService.createSession(user._id, newRefreshToken, request);

  return {
    access_token: accessToken,
    refresh_token: newRefreshToken,
  };
}

async logout(refreshToken: string) {
  await this.authSessionService.deleteSession(refreshToken);
  return { message: 'Logged out successfully' };
}

async logoutAll(userId: string, currentSessionId?: string) {
  await this.authSessionService.deleteAllSessions(userId, currentSessionId);
  return { message: 'Logged out from all devices' };
}

async changePassword(userId: string, oldPassword: string, newPassword: string, logoutOtherDevices: boolean) {
  const user = await this.userRepository.getById(userId);
  await this.authProviderService.verifyEmailPassword(user.email, oldPassword);
  
  await this.authProviderService.updateCredentials(userId, AuthProvider.EMAIL, newPassword);

  if (logoutOtherDevices) {
    await this.authSessionService.deleteAllSessions(userId);
  }

  return { message: 'Password changed successfully' };
}

private generateAccessToken(user: any): string {
  const payload = {
    sub: user._id,
    id: user._id,
    email: user.email,
    fullname: user.fullname,
    avatar: user.avatar,
    role: user.role,
  };
  return this.jwtService.sign(payload);
}
```

- [ ] **Step 4: Keep existing forgotPassword and resetPassword methods**

Keep these methods as they are (no changes needed).

- [ ] **Step 5: Commit**

```bash
git add src/modules/auth/services/auth.service.ts
git commit -m "refactor: update AuthService to use new provider and session services"
```

---

## Task 13: Update AuthController

**Files:**
- Modify: `src/modules/auth/controllers/auth.controller.ts`

- [ ] **Step 1: Update login endpoint**

Modify login method to accept provider query param:

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus, Query, Req } from '@nestjs/common';
import { Request } from 'express';

@HttpCode(HttpStatus.OK)
@Post('login')
async login(
  @Query('provider') provider: string,
  @Body() loginDto: LoginDto,
  @Req() request: Request,
) {
  if (!provider) {
    throw ApiError.BadRequest('Provider query parameter is required (email|google)');
  }
  return this.authService.login(provider, loginDto, request);
}
```

- [ ] **Step 2: Update refresh endpoint**

```typescript
@HttpCode(HttpStatus.OK)
@Post('refresh')
async refresh(
  @Body() refreshTokenDto: RefreshTokenDto,
  @Req() request: Request,
) {
  return this.authService.refresh(refreshTokenDto.refreshToken, request);
}
```

- [ ] **Step 3: Add logout endpoints**

```typescript
@Post('logout')
async logout(@Body('refreshToken') refreshToken: string) {
  return this.authService.logout(refreshToken);
}

@Post('logout-all')
async logoutAll(@Req() request: any) {
  const userId = request.user.id;
  return this.authService.logoutAll(userId);
}
```

- [ ] **Step 4: Add change password endpoint**

```typescript
@Post('change-password')
async changePassword(
  @Req() request: any,
  @Body() changePasswordDto: ChangePasswordDto,
) {
  const userId = request.user.id;
  return this.authService.changePassword(
    userId,
    changePasswordDto.oldPassword,
    changePasswordDto.newPassword,
    changePasswordDto.logoutOtherDevices || false,
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/auth/controllers/auth.controller.ts
git commit -m "feat: update AuthController with provider-based login and new endpoints"
```

---

## Task 14: Update User Model

**Files:**
- Modify: `src/modules/user/models/user.model.ts`
- Modify: `src/modules/user/entities/user.entity.ts`

- [ ] **Step 1: Remove auth fields from User model**

Remove `password`, `refreshToken`, and `comparePassword` method from `src/modules/user/models/user.model.ts`.

- [ ] **Step 2: Remove auth fields from User entity**

Remove `password` and `refreshToken` from `src/modules/user/entities/user.entity.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/modules/user/models/user.model.ts src/modules/user/entities/user.entity.ts
git commit -m "refactor: remove auth fields from User model"
```

---

## Task 15: Update Auth Module

**Files:**
- Modify: `src/modules/auth/auth.module.ts`

- [ ] **Step 1: Register new providers**

Update `src/modules/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthProviderService } from './services/auth-provider.service';
import { AuthSessionService } from './services/auth-session.service';
import { AuthProviderRepository } from './repositories/auth-provider.repository';
import { AuthSessionRepository } from './repositories/auth-session.repository';
import { AuthProviderModel } from './models/auth-provider.model';
import { AuthSessionModel } from './models/auth-session.model';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '@Modules/user/user.module';
import { SendMailModule } from '../send-mail/send-mail.module';

@Module({
  imports: [
    SendMailModule,
    UsersModule,
    PassportModule,
    SequelizeModule.forFeature([AuthProviderModel, AuthSessionModel]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthProviderService,
    AuthSessionService,
    AuthProviderRepository,
    AuthSessionRepository,
    JwtStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/auth/auth.module.ts
git commit -m "feat: register new auth providers and services in AuthModule"
```

---

## Task 16: Update Database Module

**Files:**
- Modify: `src/database/database.module.ts`

- [ ] **Step 1: Register new models**

Add `AuthProviderModel` and `AuthSessionModel` to the models array in `src/database/database.module.ts`.

- [ ] **Step 2: Commit**

```bash
git add src/database/database.module.ts
git commit -m "feat: register AuthProvider and AuthSession models in database"
```

---

## Task 17: Add Environment Variables

**Files:**
- Create: `.env.example` (if not exists)

- [ ] **Step 1: Document new env vars**

Add to `.env.example`:

```
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
```

- [ ] **Step 2: Update config**

Add Google client ID to `src/config/app.config.ts` if needed.

- [ ] **Step 3: Commit**

```bash
git add .env.example src/config/app.config.ts
git commit -m "docs: add Google OAuth environment variables"
```

---

## Task 18: Final Testing & Verification

**Files:**
- N/A

- [ ] **Step 1: Run database sync**

```bash
npm run start:dev
```

Expected: Tables `auth_provider` and `auth_session` created successfully

- [ ] **Step 2: Test email login**

```bash
curl -X POST http://localhost:3000/auth/login?provider=email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected: Returns access_token, refresh_token, user

- [ ] **Step 3: Test refresh token**

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<token-from-login>"}'
```

Expected: Returns new access_token and refresh_token

- [ ] **Step 4: Test logout**

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<token>"}'
```

Expected: Success message

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete auth module refactoring with multi-provider support"
```

---

## Implementation Complete

All tasks completed! The auth module now supports:
- ✅ Multi-provider authentication (email/password, Google OAuth)
- ✅ Multi-device sessions with token rotation
- ✅ Hashed refresh tokens for security
- ✅ Device tracking and IP logging
- ✅ Flexible password management
- ✅ Account linking for Google OAuth

**Next Steps:**
1. Write comprehensive tests for new services
2. Add API documentation (Swagger decorators)
3. Implement session management UI endpoints (optional)
4. Add more OAuth providers (Facebook, GitHub) if needed

