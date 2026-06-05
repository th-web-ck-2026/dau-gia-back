import { TrangThaiXacMinhUser } from '../common/constant';
import { IsString, IsEnum, ValidateIf, MinLength } from 'class-validator';

export class AdminDuyetDonXacMinhDto {
  @ValidateIf((o) => o.trangThai === TrangThaiXacMinhUser.TU_CHOI)
  @IsString()
  lyDoTuChoi: string;

  @IsEnum(TrangThaiXacMinhUser)
  trangThai: TrangThaiXacMinhUser;
}
