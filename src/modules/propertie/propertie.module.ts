import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PropertieModel } from './models/propertie.model';
import { PropertieController } from './controllers/propertie.controller';
import { PropertieService } from './services/propertie.service';
import { PropertieRepository } from './repositories/propertie.repository';

@Module({
  imports: [SequelizeModule.forFeature([PropertieModel])],
  controllers: [PropertieController],
  providers: [PropertieService, PropertieRepository],
  exports: [PropertieService, PropertieRepository],
})
export class PropertieModule {}
