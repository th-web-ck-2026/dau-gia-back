import { PartialType } from '@nestjs/mapped-types';
import { CreateHoaDonDto } from './create-hoa-don.dto';

export class UpdateHoaDonDto extends PartialType(CreateHoaDonDto) {}
