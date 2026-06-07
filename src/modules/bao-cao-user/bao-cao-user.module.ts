import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BaoCaoUserModel } from './models/bao-cao-user.model';
import { BaoCaoUserController } from './controllers/bao-cao-user.controller';
import { BaoCaoUserService } from './services/bao-cao-user.service';
import { BaoCaoUserRepository } from './repositories/bao-cao-user.repository';
import { UsersModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    SequelizeModule.forFeature([BaoCaoUserModel]),
    UsersModule,
    NotificationModule,
  ],
  controllers: [BaoCaoUserController],
  providers: [BaoCaoUserService, BaoCaoUserRepository],
  exports: [BaoCaoUserService, BaoCaoUserRepository],
})
export class BaoCaoUserModule {}
