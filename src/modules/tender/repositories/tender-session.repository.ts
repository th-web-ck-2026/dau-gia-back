import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/base/base.repository';
import { TenderSession } from '../entities/tender-session.entity';
import { TenderSessionModel } from '../models/tender-session.model';

@Injectable()
export class TenderSessionRepository extends BaseRepository<TenderSession> {
  constructor() {
    super(TenderSessionModel);
  }
}
