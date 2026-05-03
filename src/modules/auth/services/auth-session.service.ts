import { Injectable } from '@nestjs/common';
import { AuthSessionRepository } from '../repositories/auth-session.repository';
import { hashToken } from '@/common/utils/crypto.util';
import { parseDeviceInfo, extractIpAddress } from '@/common/utils/device-parser.util';
import { Request } from 'express';
import { ApiError } from '@Exceptions/api-error';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';

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
