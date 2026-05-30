import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/base/base.repository';
import { TenderSubmission } from '../entities/tender-submission.entity';
import { TenderSubmissionModel } from '../models/tender-submission.model';

@Injectable()
export class TenderSubmissionRepository extends BaseRepository<TenderSubmission> {
  constructor() {
    super(TenderSubmissionModel);
  }
}
