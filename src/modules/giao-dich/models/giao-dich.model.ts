import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { GiaoDich } from '../entities/giao-dich.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiGiaoDich } from '../common/constants';

@Table({
  tableName: EntityTable.GIAO_DICH,
})
export class GiaoDichModel extends Model implements GiaoDich {
  @StrObjectId()
  _id: string;

  @Column({ allowNull: false, unique: true })
  phienId: string;

  @Column({
    type: DataType.ENUM(...Object.values(LoaiPhien)),
    allowNull: false,
  })
  loaiPhien: LoaiPhien;

  @Column({ allowNull: false })
  chuPhienId: string;

  @Column({ allowNull: false })
  nguoiThangId: string;

  @Column({
    type: DataType.ENUM(...Object.values(TrangThaiGiaoDich)),
    defaultValue: TrangThaiGiaoDich.CHO_XAC_NHAN,
  })
  trangThai: TrangThaiGiaoDich;

  @Column({ type: DataType.FLOAT, allowNull: true })
  giaChot: number;

  @Column({ allowNull: false })
  hanXacNhan: Date;

  @Column({ allowNull: true })
  thoiDiemXacNhan: Date;

  @Column({ allowNull: true })
  lyDoThatBai: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  anhChungTu: string[];

  @Column({ allowNull: true })
  thoiDiemNguoiThangBaoDaCK: Date;

  @Column({ allowNull: true })
  thoiDiemChuPhienXacNhanTien: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  chuPhienDaKy: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  nguoiThangDaKy: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  daBanGiao: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  nguoiThangXacNhanNhan: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  ghiChuLienHeChuPhien: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  ghiChuLienHeNguoiThang: string;

  @Column({ allowNull: true })
  thoiDiemHoanTat: Date;
}
