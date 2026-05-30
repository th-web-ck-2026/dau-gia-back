import { Table, Column, DataType, Model } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { TenderSession } from '../entities/tender-session.entity';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';

@Table({
  tableName: EntityTable.TENDER_SESSION,
})
export class TenderSessionModel extends Model implements TenderSession {
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  danhSachHinhAnh: string[];
  @StrObjectId()
  _id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tieuDe: string;

  @Column({
    type: DataType.TEXT,
  })
  moTa?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  chuPhienId: string;

  @Column({
    type: DataType.ENUM(...Object.values(TrangThaiPhien)),
    defaultValue: TrangThaiPhien.NHAP,
    allowNull: false,
  })
  trangThai: TrangThaiPhien;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  thoiGianBatDau: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  thoiGianKetThuc: Date;

  @Column({
    type: DataType.DECIMAL,
  })
  giaToiDa?: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0.6,
    allowNull: false,
  })
  trongSoKyThuat: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0.4,
    allowNull: false,
  })
  trongSoGia: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 50,
    allowNull: false,
  })
  diemKyThuatToiThieu: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  anDanh: boolean;

  @Column({
    type: DataType.DATE,
  })
  thoiDiemCongBo?: Date;

  @Column({
    type: DataType.DATE,
  })
  thoiDiemDong?: Date;

  @Column({
    type: DataType.STRING,
  })
  deXuatThangId?: string;
}
