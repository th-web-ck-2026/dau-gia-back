import { Module } from '@nestjs/common';
import { TenderController } from './controllers/tender.controller';
import { TenderService } from './services/tender.service';
import { TenderSessionRepository } from './repositories/tender-session.repository';
import { TenderCriteriaRepository } from './repositories/tender-criteria.repository';
import { TenderSubmissionRepository } from './repositories/tender-submission.repository';
import { TenderSubmissionValueRepository } from './repositories/tender-submission-value.repository';
import { ScoringModule } from '@/modules/scoring/scoring.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { GiaoDichModule } from '@/modules/giao-dich/giao-dich.module';

@Module({
  imports: [ScoringModule, NotificationModule, GiaoDichModule],
  controllers: [TenderController],
  providers: [
    TenderService,
    TenderSessionRepository,
    TenderCriteriaRepository,
    TenderSubmissionRepository,
    TenderSubmissionValueRepository,
  ],
  exports: [TenderService],
})
export class TenderModule {}
