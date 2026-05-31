import { ApiProperty } from '@nestjs/swagger';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';

export class AuctionSessionStatusDto {
  @ApiProperty({ description: 'ID phiên đấu giá' })
  phienDauGiaId: string;

  @ApiProperty({ description: 'Giá hiện tại' })
  giaHienTai: number;

  @ApiProperty({ description: 'Biệt danh người dẫn đầu' })
  bietDanhNguoiDanDau: string;

  @ApiProperty({ description: 'Tổng số lượt đặt giá' })
  tongSoLuotDat: number;

  @ApiProperty({ description: 'Số lượng người tham gia unique' })
  soLuongNguoiThamGia: number;

  @ApiProperty({ description: 'Bước giá' })
  buocGia: number;

  @ApiProperty({ description: 'Giá hợp lệ kế tiếp' })
  giaHopLeKeTiep: number;

  @ApiProperty({ description: 'Thời gian phía máy chủ' })
  thoiGianServer: Date;

  @ApiProperty({ description: 'Thời gian kết thúc phiên' })
  thoiGianKetThuc: Date;

  @ApiProperty({ enum: TrangThaiPhien, description: 'Trạng thái phiên' })
  trangThai: TrangThaiPhien;
}
