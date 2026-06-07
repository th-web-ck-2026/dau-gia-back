import { PartialType } from '@nestjs/swagger';
import { CreateThongKeDto } from './create-thong-ke.dto';

export class UpdateThongKeDto extends PartialType(CreateThongKeDto) {}
