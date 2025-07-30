import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { MailConfig } from '../entities/mail-config.entity';
import { MailConfigRepository } from '../repositories/mail-config.repository';
import { CreateMailConfigDto } from '../dto/create-mail-config.dto';
import { UpdateMailConfigDto } from '../dto/update-mail-config.dto';

@Injectable()
export class MailConfigService extends BaseService<MailConfig> {
  constructor(private readonly mailConfigRepository: MailConfigRepository) {
    super(mailConfigRepository);
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
