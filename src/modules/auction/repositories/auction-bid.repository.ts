import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/base/base.repository';
import { AuctionBid } from '../entities/auction-bid.entity';
import { AuctionBidModel } from '../models/auction-bid.model';

@Injectable()
export class AuctionBidRepository extends BaseRepository<AuctionBid> {
  constructor() {
    super(AuctionBidModel);
  }
}
