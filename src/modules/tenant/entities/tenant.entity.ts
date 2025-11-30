import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";
import { IsEnum, IsString } from 'class-validator';
import { TenantTrangThai } from '../common/constant';
import { User } from '@/modules/user/entities/user.entity';

export class Tenant implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  code: string;
  @IsString()
  khachHangUserId: string;
  @IsString()
  hopDongThueId: string;
  @IsEnum(TenantTrangThai)
  trangThai: TenantTrangThai;

  khachHangUser?: User;
}
