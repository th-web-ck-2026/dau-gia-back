import { Global, Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [CronJobService],
  exports: [CronJobService],
})
export class CronJobModule {}
