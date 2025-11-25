import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TenantModel } from './models/tenant.model';
import { TenantChoThueController } from './controllers/tenant.cho-thue.controller';
import { TenantChoThueService } from './services/tenant.cho-thue.service';
import { TenantRepository } from './repositories/tenant.repository';
import { TenantNguoiThueController } from './controllers/tenant.nguoi-thue.controller';
import { TenantNguoiThueService } from './services/tenant.nguoi-thue.service';
import { UnitModule } from '../unit/unit.module';

@Module({
  imports: [SequelizeModule.forFeature([TenantModel]), UnitModule],
  controllers: [TenantChoThueController, TenantNguoiThueController],
  providers: [TenantChoThueService, TenantNguoiThueService, TenantRepository],
  exports: [TenantChoThueService, TenantNguoiThueService, TenantRepository],
})
export class TenantModule {}
