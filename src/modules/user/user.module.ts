import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './controllers/user.controller';
import { UsersService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
