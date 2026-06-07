import { PartialType, PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsOptional } from 'class-validator';

export class ConditionUserDto extends PartialType(
  PickType(User, [
    '_id',
    'email',
    'phone',
    'fullname',
    'role',
    'userRoles',
    'userStatus',
    'isVerified',
  ]),
) {
  @IsOptional()
  email?: string;
  @IsOptional()
  phone?: string;
  @IsOptional()
  fullname?: string;
}
