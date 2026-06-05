import { OmitType } from '@nestjs/swagger';
import { ToChucProfile } from '../entities/to-chuc-profile.entity';

export class CreateToChucProfileDto extends OmitType(ToChucProfile, ['_id']) {
  
}
