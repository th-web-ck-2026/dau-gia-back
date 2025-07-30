import { PartialType, PickType } from '@nestjs/swagger';
import { Class } from '../entities/class.entity';

export class ConditionClassDto extends PartialType(
  PickType(Class, ['grade', 'subject', 'location', 'mode', 'tutor_id']),
) {}
