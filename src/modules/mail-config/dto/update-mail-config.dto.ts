import { PartialType } from '@nestjs/swagger';
import { CreateMailConfigDto } from './create-mail-config.dto';

export class UpdateMailConfigDto extends PartialType(CreateMailConfigDto) {}
