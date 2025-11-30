import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HopDongThueService } from './services/hop-dong-thue.service';
import { HopDongThueRepository } from './repositories/hop-dong-thue.repository';
import { UnitModule } from '../unit/unit.module';
import { UsersModule } from '../user/user.module';
import { TenantModule } from '../tenant/tenant.module';
import { HopDongThueNguoiChoThueController } from './controllers/hop-dong-thue.nguoi-cho-thue.controller';
import { HopDongThueNguoiThueController } from './controllers/hop-dong-thue.nguoi-thue.controller';

@Module({
  imports: [
    forwardRef(() => UnitModule),
    forwardRef(() => UsersModule),
    forwardRef(() => TenantModule),
  ],
  controllers: [
    HopDongThueNguoiThueController,
    HopDongThueNguoiChoThueController,
  ],
  providers: [HopDongThueService, HopDongThueRepository],
  exports: [HopDongThueService, HopDongThueRepository],
})
export class HopDongThueModule {}
