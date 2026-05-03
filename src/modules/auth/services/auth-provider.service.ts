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
