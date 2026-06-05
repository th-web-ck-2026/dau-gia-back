import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { MailConfig } from '../entities/mail-config.entity';
import { MailConfigRepository } from '../repositories/mail-config.repository';
import { CreateMailConfigDto } from '../dto/create-mail-config.dto';
import { UpdateMailConfigDto } from '../dto/update-mail-config.dto';

@Injectable()
export class MailConfigService extends BaseService<MailConfig> implements OnModuleInit {
  constructor(private readonly mailConfigRepository: MailConfigRepository) {
    super(mailConfigRepository);
  }

  async onModuleInit() {
    const mailConfig = await this.mailConfigRepository.getOne({
      where: { name: 'default' },
    });
    if (!mailConfig) {
      await this.mailConfigRepository.create({
        name: 'default',
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT) || 587,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
        is_active: true,
      });
    }
  }

  async create(createMailConfigDto: CreateMailConfigDto): Promise<MailConfig> {
    return this.mailConfigRepository.create(createMailConfigDto);
  }

  async findAll(): Promise<MailConfig[]> {
    return this.mailConfigRepository.getMany();
  }

  async findOne(id: string): Promise<MailConfig> {
    return this.mailConfigRepository.getById(id);
  }

  async update(id: string, updateMailConfigDto: UpdateMailConfigDto): Promise<MailConfig> {
    return this.mailConfigRepository.updateOne(updateMailConfigDto, { where: { _id: id } });
  }

  async remove(id: string): Promise<MailConfig> {
    return this.mailConfigRepository.deleteOne({ where: { _id: id } });
  }
}
