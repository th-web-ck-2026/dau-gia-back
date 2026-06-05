import { OmitType } from '@nestjs/swagger';
import { XacMinhUser } from '../entities/xac-minh-user.entity';

export class CreateXacMinhUserDto extends OmitType(XacMinhUser, ['_id']) {
  
}
