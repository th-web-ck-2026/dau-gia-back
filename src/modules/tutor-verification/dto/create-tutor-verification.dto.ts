import { OmitType, PickType } from '@nestjs/swagger';
import { TutorVerification } from '../entities/tutor-verification.entity';

export class CreateTutorVerificationDto extends PickType(TutorVerification, [
    'cccd_back',
    'cccd_front',
    'face',
]) {}
