import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThongTinThanhToanModel } from './models/thong-tin-thanh-toan.model';
import { ThongTinThanhToanController } from './controllers/thong-tin-thanh-toan.controller';
import { ThongTinThanhToanService } from './services/thong-tin-thanh-toan.service';
import { ThongTinThanhToanRepository } from './repositories/thong-tin-thanh-toan.repository';

@Module({
  imports: [],
  controllers: [ThongTinThanhToanController],
  providers: [ThongTinThanhToanService, ThongTinThanhToanRepository],
  exports: [ThongTinThanhToanService, ThongTinThanhToanRepository],
})
export class ThongTinThanhToanModule {}
