import { Module } from '@nestjs/common';
import { AuctionController } from './controllers/auction.controller';
import { AuctionService } from './services/auction.service';
import { AuctionSessionRepository } from './repositories/auction-session.repository';
import { AuctionBidRepository } from './repositories/auction-bid.repository';
import { ScoringModule } from '@/modules/scoring/scoring.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { GiaoDichModule } from '@/modules/giao-dich/giao-dich.module';

@Module({
  imports: [ScoringModule, NotificationModule, GiaoDichModule],
  controllers: [AuctionController],
  providers: [
    AuctionService,
    AuctionSessionRepository,
    AuctionBidRepository,
  ],
  exports: [AuctionService],
})
export class AuctionModule {}
