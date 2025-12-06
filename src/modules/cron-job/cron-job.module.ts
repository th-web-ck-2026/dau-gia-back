import { Global, Module } from '@nestjs/common';
import { HoaDonCronJobService } from './hoa-don.cron-job.service';
import { HoaDonModule } from '../hoa-don/hoa-don.module';
import { HopDongCronJobService } from './hop-dong.cron-job.service';
import { HopDongThueModule } from '../hop-dong-thue/hop-dong-thue.module';

@Global()
@Module({
  imports: [HoaDonModule, HopDongThueModule],
  controllers: [],
  providers: [HoaDonCronJobService, HopDongCronJobService],
  exports: [HoaDonCronJobService, HopDongCronJobService],
})
export class CronJobModule {}
