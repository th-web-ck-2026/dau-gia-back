import { Module } from '@nestjs/common';
import { YeuCauBaoTriBaoDuongRepository } from './repositories/yeu-cau-bao-tri-bao-duong.repository';
import { YeuCauBaoTriBaoDuongThueService } from './services/yeu-cau-bao-tri-bao-duong.thue.service';
import { YeuCauBaoTriBaoDuongChoThueService } from './services/yeu-cau-bao-tri-bao-duong.cho-thue.service';
import { YeuCauBaoTriBaoDuongNguoiThueController } from './controllers/yeu-cau-bao-tri-bao-duong.thue.controller';
import { YeuCauBaoTriBaoDuongChoThueController } from './controllers/yeu-cau-bao-tri-bao-duong.cho-thue.controller';
import { UnitModule } from '../unit/unit.module';
import { HopDongThueModule } from '../hop-dong-thue/hop-dong-thue.module';

@Module({
  imports: [UnitModule, HopDongThueModule],
  controllers: [
    YeuCauBaoTriBaoDuongChoThueController,
    YeuCauBaoTriBaoDuongNguoiThueController,
  ],
  providers: [
    YeuCauBaoTriBaoDuongChoThueService,
    YeuCauBaoTriBaoDuongThueService,
    YeuCauBaoTriBaoDuongRepository,
  ],
  exports: [
    YeuCauBaoTriBaoDuongChoThueService,
    YeuCauBaoTriBaoDuongThueService,
    YeuCauBaoTriBaoDuongRepository,
  ],
})
export class YeuCauBaoTriBaoDuongModule {}
