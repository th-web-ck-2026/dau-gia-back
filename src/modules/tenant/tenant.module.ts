import { forwardRef, Module } from '@nestjs/common';
import { TenantChoThueController } from './controllers/tenant.cho-thue.controller';
import { TenantChoThueService } from './services/tenant.cho-thue.service';
import { TenantRepository } from './repositories/tenant.repository';
import { TenantNguoiThueController } from './controllers/tenant.nguoi-thue.controller';
import { TenantNguoiThueService } from './services/tenant.nguoi-thue.service';
import { UnitModule } from '../unit/unit.module';
import { HopDongThueModule } from '../hop-dong-thue/hop-dong-thue.module';
import { UsersModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => UnitModule),
    forwardRef(() => UsersModule),
    forwardRef(() => HopDongThueModule),
  ],
  controllers: [TenantChoThueController, TenantNguoiThueController],
  providers: [TenantChoThueService, TenantNguoiThueService, TenantRepository],
  exports: [TenantChoThueService, TenantNguoiThueService, TenantRepository],
})
export class TenantModule {}
