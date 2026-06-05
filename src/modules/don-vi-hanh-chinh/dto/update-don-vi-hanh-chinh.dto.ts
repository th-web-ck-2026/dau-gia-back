import { PartialType } from '@nestjs/mapped-types';
import { CreateDonViHanhChinhDto } from './create-don-vi-hanh-chinh.dto';

export class UpdateDonViHanhChinhDto extends PartialType(CreateDonViHanhChinhDto) {}
