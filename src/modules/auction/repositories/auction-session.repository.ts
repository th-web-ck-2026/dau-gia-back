import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/base/base.repository';
import { AuctionSession } from '../entities/auction-session.entity';
import { AuctionSessionModel } from '../models/auction-session.model';

@Injectable()
export class AuctionSessionRepository extends BaseRepository<AuctionSession> {
  constructor() {
    super(AuctionSessionModel);
  }
}
