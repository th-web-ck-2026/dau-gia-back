import { PartialType } from '@nestjs/mapped-types';
import { CreateThongTinThanhToanDto } from './create-thong-tin-thanh-toan.dto';

export class UpdateThongTinThanhToanDto extends PartialType(CreateThongTinThanhToanDto) {}
