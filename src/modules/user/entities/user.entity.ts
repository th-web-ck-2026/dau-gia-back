import { Gender, UserRoles, UserRoleType, UserStatus } from '../common/constant';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@Common/constants/base.constant';

export class User implements BaseEntity {
  @StrObjectId()
  _id: string;

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
  @IsOptional()
  birthday?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(UserRoleType)
  userRoles: UserRoleType;

  @IsNotEmpty()
  @IsEnum(UserRoles)
  role: UserRoles;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsEnum(UserStatus)
  userStatus?: UserStatus;

  @IsOptional()
  verifyScore?: number;

  @IsString()
  @IsOptional()
  tenTinhTp?: string;

  @IsString()
  @IsOptional()
  maTinhTp?: string;

  @IsString()
  @IsOptional()
  tenXaPhuong?: string;

  @IsString()
  @IsOptional()
  maXaPhuong?: string;

  @IsString()
  @IsOptional()
  diaChi?: string;

  @IsString()
  @IsOptional()
  soCccd?: string;
  @IsString()
  @IsOptional()
  ngayCapCccd?: string;
  @IsString()
  @IsOptional()
  noiCapCccd?: string;

  // thong Tin ngan hang
  @IsString()
  @IsOptional()
  tenNganHang?: string;

  @IsString()
  @IsOptional()
  soTaiKhoan?: string;

  @IsString()
  @IsOptional()
  tenTaiKhoan?: string;
}
