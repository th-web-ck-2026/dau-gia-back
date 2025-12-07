import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThongKeController } from './controllers/thong-ke.controller';
import { ThongKeService } from './services/thong-ke.service';
import { HoaDonModule } from '../hoa-don/hoa-don.module';
import { HopDongThueModule } from '../hop-dong-thue/hop-dong-thue.module';
import { PropertieModule } from '../propertie/propertie.module';
import { UnitModule } from '../unit/unit.module';

@Module({
  imports: [HoaDonModule, HopDongThueModule, PropertieModule, UnitModule],
  controllers: [ThongKeController],
  providers: [ThongKeService],
  exports: [ThongKeService],
})
export class ThongKeModule {}
