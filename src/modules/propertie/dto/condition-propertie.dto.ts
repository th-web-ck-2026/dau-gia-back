import { PartialType } from '@nestjs/mapped-types';
import { Propertie } from '../entities/propertie.entity';

export class ConditionPropertieDto extends PartialType(Propertie) {}
