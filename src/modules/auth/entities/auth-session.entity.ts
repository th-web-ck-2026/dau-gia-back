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
