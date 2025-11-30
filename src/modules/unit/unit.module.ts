import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UnitModel } from './models/unit.model';
import { UnitController } from './controllers/unit.controller';
import { UnitService } from './services/unit.service';
import { UnitRepository } from './repositories/unit.repository';

@Module({
  imports: [],
  controllers: [UnitController],
  providers: [UnitService, UnitRepository],
  exports: [UnitService, UnitRepository],
})
export class UnitModule {}
