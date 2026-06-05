import { OmitType } from '@nestjs/swagger';
import { DonViHanhChinh } from '../entities/don-vi-hanh-chinh.entity';

export class CreateDonViHanhChinhDto extends OmitType(DonViHanhChinh, ['_id']) {
  
}
