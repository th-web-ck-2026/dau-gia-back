import { PartialType } from '@nestjs/mapped-types';
import { CreateTutorVerificationDto } from './create-tutor-verification.dto';

export class UpdateTutorVerificationDto extends PartialType(CreateTutorVerificationDto) {}
