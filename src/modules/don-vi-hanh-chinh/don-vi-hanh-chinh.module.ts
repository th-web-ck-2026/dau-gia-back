import { Module } from '@nestjs/common';
import { DonViHanhChinhController } from './controllers/don-vi-hanh-chinh.controller';
import { DonViHanhChinhService } from './services/don-vi-hanh-chinh.service';
import { DonViHanhChinhRepository } from './repositories/don-vi-hanh-chinh.repository';

@Module({
  imports: [],
  controllers: [DonViHanhChinhController],
  providers: [DonViHanhChinhService, DonViHanhChinhRepository],
  exports: [DonViHanhChinhService, DonViHanhChinhRepository],
})
export class DonViHanhChinhModule {}
