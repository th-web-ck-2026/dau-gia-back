import { Global, Module } from '@nestjs/common';
import { HoaDonCronJobService } from './hoa-don.cron-job.service';
import { HoaDonModule } from '../hoa-don/hoa-don.module';

@Global()
@Module({
  imports: [HoaDonModule],
  controllers: [],
  providers: [HoaDonCronJobService],
  exports: [HoaDonCronJobService],
})
export class CronJobModule {}
