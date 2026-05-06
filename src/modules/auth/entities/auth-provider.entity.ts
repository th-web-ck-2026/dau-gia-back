import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { AuthProvider as AuthProviderEnum } from '../common/constants';
import { User } from '@/modules/user/entities/user.entity';

export interface AuthProvider extends BaseEntity {
  _id: string;
  userId: string;
  provider: AuthProviderEnum;
  providerId: string;
  credentials: string | null;
  isVerified: boolean;
  user?: User;
}
