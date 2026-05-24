import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { SequelizeModel } from '../modules/repository/common/sequelize-model';

export const databaseConfig = (
  configService: ConfigService,
): SequelizeModuleOptions => ({
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  models: SequelizeModel,
  autoLoadModels: true,
  synchronize: configService.get<boolean>('DB_SYNC', false),
  sync: {
    alter: true,
  },
  logging:
    configService.get<string>('NODE_ENV') === 'development'
      ? console.log
      : false,
  define: {
    timestamps: true,
  },
});
