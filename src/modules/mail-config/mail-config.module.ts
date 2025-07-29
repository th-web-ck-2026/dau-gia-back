import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailConfigModel } from './models/mail-config.model';
import { MailConfigController } from './controllers/mail-config.controller';
import { MailConfigService } from './services/mail-config.service';
import { MailConfigRepository } from './repositories/mail-config.repository';

@Module({
  imports: [SequelizeModule.forFeature([MailConfigModel])],
  controllers: [MailConfigController],
  providers: [MailConfigService, MailConfigRepository],
  exports: [MailConfigService, MailConfigRepository],
})
export class MailConfigModule {}
