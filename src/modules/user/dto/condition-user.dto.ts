import { PartialType, PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ConditionUserDto extends PartialType(
  PickType(User, ['_id', 'email', 'phone', 'fullname']),
) {}
