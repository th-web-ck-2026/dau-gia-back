import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThongKeModel } from './models/thong-ke.model';
import { ThongKeController } from './controllers/thong-ke.controller';
import { ThongKeService } from './services/thong-ke.service';
import { ThongKeRepository } from './repositories/thong-ke.repository';

@Module({
  imports: [],
  controllers: [ThongKeController],
  providers: [ThongKeService, ThongKeRepository],
  exports: [ThongKeService, ThongKeRepository],
})
export class ThongKeModule {}
