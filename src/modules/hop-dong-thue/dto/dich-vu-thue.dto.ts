import { IsString, IsNumber, IsOptional } from "class-validator";

export class DichVuThue {
    @IsString()
    tenDichVu: string;
    @IsNumber()
    gia: number;
    @IsString()
    donViTinh: string;
    @IsString()
    @IsOptional()
    ghiChu?: string;
  }