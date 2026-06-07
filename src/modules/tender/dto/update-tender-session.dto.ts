import { PartialType } from '@nestjs/swagger';
import { CreateTenderSessionDto } from './create-tender-session.dto';

export class UpdateTenderSessionDto extends PartialType(CreateTenderSessionDto) {}
