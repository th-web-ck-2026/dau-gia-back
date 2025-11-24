import { UserRoles } from '@/modules/user/common/constant';
import { User } from '@/modules/user/entities/user.entity';
import { PickType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class RegisterDto extends PickType(User, [
  'fullname',
  'email',
  'phone',
  'password',
]) {
}
