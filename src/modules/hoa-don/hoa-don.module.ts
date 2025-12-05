import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HoaDonModel } from './models/hoa-don.model';
import { HoaDonChoThueController } from './controllers/hoa-don.cho-thue.controller';
import { HoaDonChoThueService } from './services/hoa-don.cho-thue.service';
import { HoaDonRepository } from './repositories/hoa-don.repository';
import { HopDongThueModule } from '../hop-dong-thue/hop-dong-thue.module';
import { HoaDonNguoiThueController } from './controllers/hoa-don.nguoi-thue.controller';
import { HoaDonNguoiThueService } from './services/hoa-don.nguoi-thue.service';
import { HoaDonNotificationService } from './services/hoa-don.notification.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [forwardRef(() => HopDongThueModule), NotificationModule],
  controllers: [HoaDonChoThueController, HoaDonNguoiThueController],
  providers: [
    HoaDonChoThueService,
    HoaDonNguoiThueService,
    HoaDonRepository,
    HoaDonNotificationService,
  ],
  exports: [HoaDonChoThueService, HoaDonNguoiThueService, HoaDonRepository],
})
export class HoaDonModule {}
