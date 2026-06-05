import { UserRoleType } from '@/modules/user/common/constant';

export interface GoogleCredentials {
  code?: string;
  idToken?: string;
  userRoles?: UserRoleType;
}

export interface EmailCredentials {
  email: string;
  password: string;
}