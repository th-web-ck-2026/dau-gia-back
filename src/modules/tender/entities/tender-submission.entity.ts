import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { TrangThaiDeXuat } from '@/modules/scoring/common/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenderSubmission implements BaseEntity {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  phienId: string;

  @ApiProperty()
  nguoiThamGiaId: string;

  @ApiProperty({ enum: TrangThaiDeXuat })
  trangThai: TrangThaiDeXuat;

  @ApiPropertyOptional()
  diemKyThuat?: number;

  @ApiPropertyOptional()
  thuHang?: number;

  @ApiPropertyOptional()
  lyDoTuChoi?: string;

  @ApiProperty()
  thoiDiemNop: Date;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class TenderSubmissionDetails extends TenderSubmission {
  @ApiProperty({ type: () => require('./tender-submission-value.entity').TenderSubmissionValue })
  giaTriTieuChi: any[];
}
