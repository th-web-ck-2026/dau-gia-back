import { Module } from '@nestjs/common';
import { SendMailService } from './services/send-mail.service';
import { ConfigModule } from '@nestjs/config';
import { MailConfigModule } from '../mail-config/mail-config.module';

@Module({
  imports: [ConfigModule, MailConfigModule],
  controllers: [],
  providers: [SendMailService],
  exports: [SendMailService],
})
export class SendMailModule {}
