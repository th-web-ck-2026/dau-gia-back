import { PickType } from '@nestjs/swagger';
import { BaoCaoUser } from '../entities/bao-cao-user.entity';

export class CreateBaoCaoUserDto extends PickType(BaoCaoUser, [
  'nguoiBiToCaoId',
  'loai',
  'tieuDe',
  'noiDung',
  'danhSachHinhAnh',
]) {}
