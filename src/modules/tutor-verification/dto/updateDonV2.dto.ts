import { OmitType, PickType } from '@nestjs/swagger';
import { TutorVerification } from '../entities/tutor-verification.entity';

export class UpdateDonV2Dto extends PickType(TutorVerification, [
    'meeting_url',
    'meeting_time',
]) {}
