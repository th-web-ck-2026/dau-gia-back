import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HopDongThueService } from './services/hop-dong-thue.service';
import { HopDongThueRepository } from './repositories/hop-dong-thue.repository';
import { UnitModule } from '../unit/unit.module';
import { UsersModule } from '../user/user.module';
import { TenantModule } from '../tenant/tenant.module';
import { HopDongThueNguoiChoThueController } from './controllers/hop-dong-thue.nguoi-cho-thue.controller';
import { HopDongThueNguoiThueController } from './controllers/hop-dong-thue.nguoi-thue.controller';
import { HopDongThueNotificationService } from './services/hop-dong-thue.notification.service';
import { NotificationModule } from '../notification/notification.module';
import { KyThanhToanRepository } from './repositories/ky-thanh-toan.repository';

@Module({
  imports: [
    forwardRef(() => UnitModule),
    forwardRef(() => UsersModule),
    forwardRef(() => TenantModule),
    NotificationModule,
  ],
  controllers: [
    HopDongThueNguoiThueController,
    HopDongThueNguoiChoThueController,
  ],
  providers: [
    HopDongThueService,
    HopDongThueRepository,
    HopDongThueNotificationService,
    KyThanhToanRepository,
  ],
  exports: [HopDongThueService, HopDongThueRepository, KyThanhToanRepository],
})
export class HopDongThueModule {}
