import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateMailConfigDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  host: string;

  @IsInt()
  @IsOptional()
  port: number;

  @IsString()
  user: string;

  @IsString()
  pass: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
