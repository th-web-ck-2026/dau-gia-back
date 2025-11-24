import { OmitType } from '@nestjs/swagger';
import { Propertie } from '../entities/propertie.entity';

export class CreatePropertieDto extends OmitType(Propertie, ['_id', 'userId']) {}
