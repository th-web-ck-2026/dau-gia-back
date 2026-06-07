import { Global, Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { TenderModule } from '../tender/tender.module';
import { AuctionModule } from '../auction/auction.module';
import { NotificationModule } from '../notification/notification.module';
import { GiaoDichModule } from '../giao-dich/giao-dich.module';

@Global()
@Module({
  imports: [TenderModule, AuctionModule, NotificationModule, GiaoDichModule],
  controllers: [],
  providers: [CronJobService],
  exports: [CronJobService],
})
export class CronJobModule {}
