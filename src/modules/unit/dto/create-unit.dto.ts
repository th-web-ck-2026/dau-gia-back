import { OmitType } from '@nestjs/swagger';
import { Unit } from '../entities/unit.entity';

export class CreateUnitDto extends OmitType(Unit, ['_id', 'userId']) {
  
}
