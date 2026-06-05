import { OmitType, PartialType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UpdateUserProfileDto extends PartialType(
  OmitType(User, ['_id', 'email', 'role', 'userRoles', 'userStatus']),
) {}
