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
