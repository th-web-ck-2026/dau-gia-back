import { Injectable, Logger } from '@nestjs/common';
import { AuthProviderRepository } from '../repositories/auth-provider.repository';
import { AuthProvider } from '../common/constants';
import { AuthProvider as AuthProviderEntity } from '../entities/auth-provider.entity';
import { UserModel } from '@/modules/user/models/user.model';
import * as bcrypt from 'bcrypt';
import { ApiError } from '@Exceptions/api-error';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthProviderService {
  private googleClient: OAuth2Client;
  private readonly logger = new Logger(AuthProviderService.name);

  constructor(
    private authProviderRepository: AuthProviderRepository,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
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

  async findByProvider(provider: AuthProvider, providerId: string): Promise<AuthProviderEntity> {
    return this.authProviderRepository.getOne({
      where: { provider, providerId },
      include: [{ association: 'user' }],
    });
  }

  async updateCredentials(userId: string, provider: AuthProvider, newCredentials: string) {
    const authProvider = await this.authProviderRepository.getOne({
      where: { userId, provider },
    });
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
    return (authProvider as any).user;
  }
  async codeToIdTokenGoogle(code: string) {
    const ticket = await this.googleClient.getToken(code);
    return ticket.tokens.id_token;
  }
  async verifyGoogleToken(idToken: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      this.logger.error('GOOGLE_CLIENT_ID is not configured');
      throw ApiError.InternalServerError('Google login is not configured');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('No payload found in Google token');
      }

      return {
        googleSub: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      };
    } catch (error) {
      this.logger.error(`Google token verification failed: ${error.message}`);
      throw ApiError.Unauthorized('Invalid Google token');
    }
  }
}
