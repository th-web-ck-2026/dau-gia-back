import { Module } from '@nestjs/common';
import { DanhMucChungController } from './controllers/danh-muc-chung.controller';
import { DanhMucChungService } from './services/danh-muc-chung.service';
import { LoaiDanhMucRepository } from './repositories/loai-danh-muc.repository';
import { DanhMucRepository } from './repositories/danh-muc.repository';

@Module({
  imports: [],
  controllers: [DanhMucChungController],
  providers: [DanhMucChungService, LoaiDanhMucRepository, DanhMucRepository],
  exports: [DanhMucChungService, LoaiDanhMucRepository, DanhMucRepository],
})
export class DanhMucChungModule {}
