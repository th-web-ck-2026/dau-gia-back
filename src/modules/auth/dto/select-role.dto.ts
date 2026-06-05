import { UserRoleType } from '@/modules/user/common/constant';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class SelectRoleDto {
  @IsNotEmpty()
  @IsEnum(UserRoleType)
  userRoles: UserRoleType;
}
