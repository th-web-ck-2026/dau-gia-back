import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { TutorVerification } from '../entities/tutor-verification.entity';
import { TutorVerificationModel } from '../models/tutor-verification.model';
@Injectable()
export class TutorVerificationRepository extends BaseRepository<TutorVerification> {
  constructor() {
    super(TutorVerificationModel);
  }

}
