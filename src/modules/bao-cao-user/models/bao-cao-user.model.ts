import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { BaoCaoUser } from '../entities/bao-cao-user.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { LoaiBaoCao, TrangThaiBaoCao } from '../common/constants';

@Table({
  tableName: EntityTable.BAO_CAO_USER,
})
export class BaoCaoUserModel extends Model implements BaoCaoUser {
  @StrObjectId()
  _id: string;

  @Column({ allowNull: false })
  nguoiToCaoId: string;

  @Column({ allowNull: false })
  nguoiBiToCaoId: string;

  @Column({
    type: DataType.ENUM(...Object.values(LoaiBaoCao)),
    allowNull: false,
  })
  loai: LoaiBaoCao;

  @Column({ allowNull: false })
  tieuDe: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  noiDung: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  danhSachHinhAnh: string[];

  @Column({
    type: DataType.ENUM(...Object.values(TrangThaiBaoCao)),
    defaultValue: TrangThaiBaoCao.CHUA_XU_LY,
  })
  trangThai: TrangThaiBaoCao;

  @Column({ type: DataType.TEXT, allowNull: true })
  phanHoiAdmin: string;

  @Column({ allowNull: true })
  adminXuLyId: string;

  @Column({ allowNull: true })
  thoiGianXuLy: Date;
}
