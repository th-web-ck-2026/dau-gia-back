import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ToChucProfileModel } from './models/to-chuc-profile.model';
import { ToChucProfileController } from './controllers/to-chuc-profile.controller';
import { ToChucProfileService } from './services/to-chuc-profile.service';
import { ToChucProfileRepository } from './repositories/to-chuc-profile.repository';
import { UsersModule } from '../user/user.module';

@Module({
  imports: [UsersModule],
  controllers: [ToChucProfileController],
  providers: [ToChucProfileService, ToChucProfileRepository],
  exports: [ToChucProfileService, ToChucProfileRepository],
})
export class ToChucProfileModule {}
