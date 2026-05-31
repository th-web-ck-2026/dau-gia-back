import { Module } from '@nestjs/common';
import { MailConfigController } from './controllers/mail-config.controller';
import { MailConfigService } from './services/mail-config.service';
import { MailConfigRepository } from './repositories/mail-config.repository';

@Module({
  imports: [],
  controllers: [MailConfigController],
  providers: [MailConfigService, MailConfigRepository],
  exports: [MailConfigService, MailConfigRepository],
})
export class MailConfigModule {}
