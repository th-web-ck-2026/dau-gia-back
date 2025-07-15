import { ApiHideProperty, OmitType } from '@nestjs/swagger';
import { Class } from '../entities/class.entity';
import { IsOptional } from 'class-validator';

export class CreateClassDto extends OmitType(Class, [
  '_id',
  'tutor_id',
  'status',
  'tutor',
]) {
}
