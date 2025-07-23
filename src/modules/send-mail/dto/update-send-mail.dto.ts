import { PartialType } from '@nestjs/mapped-types';
import { CreateSendMailDto } from './create-send-mail.dto';

export class UpdateSendMailDto extends PartialType(CreateSendMailDto) {}
