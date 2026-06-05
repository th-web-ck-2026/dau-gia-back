import { PartialType } from '@nestjs/swagger';
import { CreateDonViHanhChinhDto } from './create-don-vi-hanh-chinh.dto';

export class UpdateDonViHanhChinhDto extends PartialType(CreateDonViHanhChinhDto) {}
