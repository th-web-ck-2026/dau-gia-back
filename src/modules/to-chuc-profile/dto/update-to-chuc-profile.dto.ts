import { PartialType } from '@nestjs/mapped-types';
import { CreateToChucProfileDto } from './create-to-chuc-profile.dto';

export class UpdateToChucProfileDto extends PartialType(CreateToChucProfileDto) {}
