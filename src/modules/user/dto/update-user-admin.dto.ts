import { OmitType, PartialType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UpdateUserAdminDto extends PartialType(
  OmitType(User, ['_id']),
) {}
