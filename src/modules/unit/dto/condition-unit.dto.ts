import { PartialType } from '@nestjs/mapped-types';
import { Unit } from '../entities/unit.entity';

export class ConditionUnitDto extends PartialType(Unit) {}
