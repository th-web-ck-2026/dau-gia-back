import { IsString, IsNumber } from "class-validator";

export class DichVuHoaDon {
  @IsString()
  tenDichVu: string;

  @IsNumber()
  gia: number;

  @IsNumber()
  soLuong: number;

  @IsNumber()
  thanhTien: number;
}

