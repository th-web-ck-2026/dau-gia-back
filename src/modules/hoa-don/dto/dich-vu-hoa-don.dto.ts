import { IsString, IsNumber, IsOptional } from "class-validator";

export class DichVuHoaDon {
  @IsString()
  tenDichVu: string;

  @IsNumber()
  gia: number;

  @IsNumber()
  soLuong: number;

  @IsNumber()
  thanhTien: number;

  @IsString()
  donViTinh: string;

  @IsString()
  @IsOptional()
  ghiChu?: string;
}

