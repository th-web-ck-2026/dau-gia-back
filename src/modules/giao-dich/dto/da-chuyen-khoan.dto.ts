import { IsArray, IsOptional, IsString } from 'class-validator';

export class DaChuyenKhoanDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  anhChungTu?: string[];
}
