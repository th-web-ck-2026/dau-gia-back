import { Module } from '@nestjs/common';
import { ScoringService } from './services/scoring.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
