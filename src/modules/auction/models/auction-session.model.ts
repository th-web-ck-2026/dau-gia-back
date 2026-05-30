import { Table, Column, DataType, Model } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { AuctionSession } from '../entities/auction-session.entity';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';

@Table({
  tableName: EntityTable.AUCTION_SESSION,
})
export class AuctionSessionModel extends Model implements AuctionSession {
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
    allowNull: false,
  })
  giaKhoiDiem: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  buocGia: number;

  @Column({
    type: DataType.DECIMAL,
  })
  giaTran?: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0.8,
    allowNull: false,
  })
  trongSoGia: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0.2,
    allowNull: false,
  })
  trongSoUyTin: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0.0,
  })
  trongSoCamKet?: number;

  @Column({
    type: DataType.STRING,
  })
  deXuatThangId?: string;

  @Column({
    type: DataType.DECIMAL,
  })
  giaCaoNhat?: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  anDanh: boolean;

  @Column({
    type: DataType.DATE,
  })
  thoiDiemDong?: Date;
}
