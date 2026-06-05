import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { XacMinhUserModel } from './models/xac-minh-user.model';
import { XacMinhUserController } from './controllers/xac-minh-user.controller';
import { XacMinhUserService } from './services/xac-minh-user.service';
import { XacMinhUserRepository } from './repositories/xac-minh-user.repository';
import { UsersModule } from '../user/user.module';

@Module({
  imports: [UsersModule],
  controllers: [XacMinhUserController],
  providers: [XacMinhUserService, XacMinhUserRepository],
  exports: [XacMinhUserService, XacMinhUserRepository],
})
export class XacMinhUserModule {}
