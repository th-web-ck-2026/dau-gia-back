import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsBoolean } from 'class-validator';

export class CreateAuctionSessionDto {
  @IsString()
  @IsNotEmpty()
  tieuDe: string;

  @IsString()
  @IsOptional()
  moTa?: string;

  @IsDateString()
  thoiGianBatDau: string;

  @IsDateString()
  thoiGianKetThuc: string;

  @IsNumber()
  @IsNotEmpty()
  giaKhoiDiem: number;

  @IsNumber()
  @IsNotEmpty()
  buocGia: number;

  @IsNumber()
  @IsOptional()
  giaTran?: number;

  @IsNumber()
  @IsOptional()
  trongSoGia?: number;

  @IsNumber()
  @IsOptional()
  trongSoUyTin?: number;

  @IsNumber()
  @IsOptional()
  trongSoCamKet?: number;

  @IsBoolean()
  @IsOptional()
  anDanh?: boolean;
}
