import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeModel } from './common/sequelize-model';

@Global()
@Module({
  imports: [SequelizeModule.forFeature(SequelizeModel)],
  providers: [],
  exports: [SequelizeModule],
})
export class RepositoryModule {}
