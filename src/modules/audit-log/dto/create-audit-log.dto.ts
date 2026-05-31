import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuditLogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nguoiThucHienId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hanhDong: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  loaiDoiTuong: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  doiTuongId: string;

  @ApiPropertyOptional()
  @IsOptional()
  truocKhi?: any;

  @ApiPropertyOptional()
  @IsOptional()
  sauKhi?: any;

  @ApiPropertyOptional()
  @IsOptional()
  duLieuBoSung?: any;
}
