import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import { TrangThaiXacMinhUser } from '../common/constant';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class XacMinhUser implements BaseEntity {
  @StrObjectId()
  _id: string;

  @IsString()
  userId: string;

  @IsString()
  anhCccdTruoc: string;

  @IsString()
  anhCccdSau: string;

  @IsString()
  anhChanDung: string;

  @IsEnum(TrangThaiXacMinhUser)
  trangThai: TrangThaiXacMinhUser;

  @IsString()
  ghiChu: string;

  @IsDateString()
  ngayXacMinh: Date;

  @IsString()
  lyDoTuChoi: string;
}
