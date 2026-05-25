import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/base/base.repository';
import { TenderCriteria } from '../entities/tender-criteria.entity';
import { TenderCriteriaModel } from '../models/tender-criteria.model';

@Injectable()
export class TenderCriteriaRepository extends BaseRepository<TenderCriteria> {
  constructor() {
    super(TenderCriteriaModel);
  }
}
