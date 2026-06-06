import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

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


  @IsBoolean()
  @IsOptional()
  anDanh?: boolean;
  
  @IsString({ each: true })
  @IsOptional()
  danhSachHinhAnh?: string[];
}
