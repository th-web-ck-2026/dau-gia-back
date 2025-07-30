import { PartialType } from '@nestjs/mapped-types';
import { OmitType } from '@nestjs/swagger';
import { TutorProfile } from '../entities/tutor-profile.entity';

export class UpdateTutorProfileDto extends PartialType(
  OmitType(TutorProfile, ['_id', 'user_id']),
) {}
