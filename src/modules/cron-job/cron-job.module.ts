import { Global, Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { TenderModule } from '../tender/tender.module';
import { AuctionModule } from '../auction/auction.module';

@Global()
@Module({
  imports: [TenderModule, AuctionModule],
  controllers: [],
  providers: [CronJobService],
  exports: [CronJobService],
})
export class CronJobModule {}
