import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
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

    const envHost = process.env.MAIL_HOST;
    const envPort = parseInt(process.env.MAIL_PORT) || 587;
    const envUser = process.env.MAIL_USER;
    const envPass = process.env.MAIL_PASSWORD;

    if (!mailConfig) {
      await this.mailConfigRepository.create({
        name: 'default',
        host: envHost,
        port: envPort,
        user: envUser,
        pass: envPass,
        is_active: true,
      });
    } else {
      // Cập nhật lại cấu hình default nếu môi trường (.env) thay đổi
      if (
        mailConfig.host !== envHost ||
        mailConfig.port !== envPort ||
        mailConfig.user !== envUser ||
        mailConfig.pass !== envPass
      ) {
        await this.mailConfigRepository.updateOne(
          {
            host: envHost,
            port: envPort,
            user: envUser,
            pass: envPass,
          },
          { where: { _id: mailConfig._id } },
        );
        Logger.log('Đã cập nhật cấu hình email default từ file .env mới', 'MailConfigService');
      }
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
