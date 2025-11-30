import { IsString, IsNumber } from "class-validator";

export class DichVuThue {
    @IsString()
    tenDichVu: string;
    @IsNumber()
    gia: number;
  }