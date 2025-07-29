import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { MailConfig } from '../entities/mail-config.entity';
import { MailConfigModel } from '../models/mail-config.model';
@Injectable()
export class MailConfigRepository extends BaseRepository<MailConfig> {
  constructor() {
    super(MailConfigModel);
  }

}
