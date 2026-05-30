import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PlaceAuctionBidDto {
  @IsString()
  @IsNotEmpty()
  phienId: string;

  @IsNumber()
  @IsNotEmpty()
  giaDat: number;

  @IsNumber()
  @IsOptional()
  diemUyTin?: number;

  @IsNumber()
  @IsOptional()
  diemCamKet?: number;
}
