import { Global, Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { TenderModule } from '../tender/tender.module';
import { AuctionModule } from '../auction/auction.module';
import { NotificationModule } from '../notification/notification.module';

@Global()
@Module({
  imports: [TenderModule, AuctionModule, NotificationModule],
  controllers: [],
  providers: [CronJobService],
  exports: [CronJobService],
})
export class CronJobModule {}
