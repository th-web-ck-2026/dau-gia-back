import { ApiProperty } from '@nestjs/swagger';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';

export class TenderSessionStatusDto {
  @ApiProperty({ description: 'ID phiên đấu thầu' })
  phienDauThauId: string;

  @ApiProperty({ description: 'Tổng số hồ sơ thầu đã nộp' })
  tongSoHoSoNop: number;

  @ApiProperty({ description: 'Số lượng người tham gia unique' })
  soLuongNguoiThamGia: number;

  @ApiProperty({ description: 'Giá trần tối đa' })
  giaToiDa?: number;

  @ApiProperty({ description: 'Thời gian phía máy chủ' })
  thoiGianServer: Date;

  @ApiProperty({ description: 'Thời gian kết thúc phiên' })
  thoiGianKetThuc: Date;

  @ApiProperty({ enum: TrangThaiPhien, description: 'Trạng thái phiên' })
  trangThai: TrangThaiPhien;
}
