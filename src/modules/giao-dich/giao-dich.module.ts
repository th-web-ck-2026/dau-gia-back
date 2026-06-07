import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GiaoDichModel } from './models/giao-dich.model';
import { GiaoDichController } from './controllers/giao-dich.controller';
import { GiaoDichService } from './services/giao-dich.service';
import { GiaoDichRepository } from './repositories/giao-dich.repository';
import { UsersModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [SequelizeModule.forFeature([GiaoDichModel]), UsersModule, NotificationModule],
  controllers: [GiaoDichController],
  providers: [GiaoDichService, GiaoDichRepository],
  exports: [GiaoDichService, GiaoDichRepository],
})
export class GiaoDichModule {}
