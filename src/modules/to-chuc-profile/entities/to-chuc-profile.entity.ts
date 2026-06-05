import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ETrangThaiXacMinh } from '../common/constant';

export class ToChucProfile implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  userId: string;
  @IsString()
  tenToChuc: string;
  @IsString()
  maSoThue: string;
  @IsString()
  soDienThoai: string;
  @IsString()
  email: string;
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
  soDangKy?: string;

  @IsDateString()
  @IsOptional()
  ngayDangKy?: Date;

  @IsString()
  @IsOptional()
  anhDangKy?: string;

  // @IsEnum(ETrangThaiXacMinh)
  // trangThaiXacMinh?: ETrangThaiXacMinh;
}
