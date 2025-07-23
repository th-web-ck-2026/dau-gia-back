import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportModel } from './models/report.model';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';
import { ReportRepository } from './repositories/report.repository';
import { UsersModule } from '@Modules/user/user.module';
import { ClassModule } from '@Modules/class/class.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ReportModel]),
    UsersModule,
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
  exports: [ReportService, ReportRepository],
})
export class ReportModule {}
