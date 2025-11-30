import { OmitType } from '@nestjs/swagger';
import { HopDongThue } from '../entities/hop-dong-thue.entity';

export class CreateHopDongThueDto extends OmitType(HopDongThue, [
  '_id',
  'userId',
  'trangThai',
]) {}
