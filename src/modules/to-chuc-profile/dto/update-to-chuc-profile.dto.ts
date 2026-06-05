import { PartialType } from '@nestjs/swagger';
import { CreateToChucProfileDto } from './create-to-chuc-profile.dto';

export class UpdateToChucProfileDto extends PartialType(
  CreateToChucProfileDto,
) {}
