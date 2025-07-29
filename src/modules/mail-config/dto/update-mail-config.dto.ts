import { PartialType } from '@nestjs/mapped-types';
import { CreateMailConfigDto } from './create-mail-config.dto';

export class UpdateMailConfigDto extends PartialType(CreateMailConfigDto) {}
