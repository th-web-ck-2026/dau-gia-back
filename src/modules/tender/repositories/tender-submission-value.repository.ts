import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/base/base.repository';
import { TenderSubmissionValue } from '../entities/tender-submission-value.entity';
import { TenderSubmissionValueModel } from '../models/tender-submission-value.model';

@Injectable()
export class TenderSubmissionValueRepository extends BaseRepository<TenderSubmissionValue> {
  constructor() {
    super(TenderSubmissionValueModel);
  }
}
