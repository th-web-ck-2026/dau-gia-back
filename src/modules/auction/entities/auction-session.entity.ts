import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@/modules/user/entities/user.entity';
import { AuctionBid } from './auction-bid.entity';

export class AuctionSession implements BaseEntity {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  tieuDe: string;

  @ApiPropertyOptional()
  moTa?: string;

  @ApiProperty()
  chuPhienId: string;

  @ApiPropertyOptional({ type: () => User })
  chuPhien?: User;

  @ApiPropertyOptional({ type: () => AuctionBid })
  deXuatThang?: AuctionBid;

  @ApiProperty({ enum: TrangThaiPhien })
  trangThai: TrangThaiPhien;

  @ApiProperty()
  thoiGianBatDau: Date;

  @ApiProperty()
  thoiGianKetThuc: Date;

  @ApiProperty()
  giaKhoiDiem: number;

  @ApiProperty()
  buocGia: number;


  @ApiPropertyOptional()
  deXuatThangId?: string;

  @ApiPropertyOptional()
  giaCaoNhat?: number;

  @ApiProperty({ type: [String] })
  danhSachHinhAnh: string[];

  @ApiProperty()
  anDanh: boolean;

  @ApiProperty()
  soLuongNguoiThamGia: number;

  @ApiPropertyOptional()
  thoiDiemDong?: Date;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}
