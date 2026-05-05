import { UserRoleType } from '@/modules/user/common/constant';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(11)
  phone: string;

  @IsString()
  soCccd: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRoleType)
  userRoles?: UserRoleType;
}
