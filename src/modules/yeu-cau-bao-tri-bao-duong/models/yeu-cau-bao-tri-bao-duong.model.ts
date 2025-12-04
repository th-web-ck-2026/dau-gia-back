import {
  Table,
  Model,
  Column,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { YeuCauBaoTriBaoDuong } from '../entities/yeu-cau-bao-tri-bao-duong.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import {
  MucDoUuTien,
  YeuCauBaoTriBaoDuongLoai,
  YeuCauBaoTriBaoDuongTrangThai,
} from '../common/constant';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { UserModel } from '@/modules/user/models/user.model';
import { User } from '@/modules/user/entities/user.entity';
import { Unit } from '@/modules/unit/entities/unit.entity';

@Table({
  tableName: EntityTable.YEU_CAU_BAO_TRI_BAO_DUONG,
})
export class YeuCauBaoTriBaoDuongModel
  extends Model
  implements YeuCauBaoTriBaoDuong
{
  @Column({
    type: DataType.ENUM(...Object.values(MucDoUuTien)),
  })
  mucDoUuTien: MucDoUuTien;
  @Column
  lyDoHuy?: string;
  @Column
  @ForeignKey(() => UserModel)
  userId: string;
  @BelongsTo(() => UserModel, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  })
  user: User;
  @Column
  @ForeignKey(() => UserModel)
  khachHangUserId: string;
  @BelongsTo(() => UserModel, {
    foreignKey: 'khachHangUserId',
    onDelete: 'CASCADE',
  })
  khachHangUser: User;
  @ForeignKey(() => UnitModel)
  @Column
  unitId: string;
  @BelongsTo(() => UnitModel, {
    foreignKey: 'unitId',
    onDelete: 'CASCADE',
  })
  unit: Unit;
  @Column({
    type: DataType.ENUM(...Object.values(YeuCauBaoTriBaoDuongLoai)),
  })
  loaiYeuCau: YeuCauBaoTriBaoDuongLoai;
  @Column
  noiDungYeuCau: string;
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  hinhAnh?: string[];
  @Column
  ngayTiepNhan?: Date;
  @Column
  ngayDuKienHoanThanh?: Date;
  @Column
  ngayHoanThanh?: Date;
  @Column
  ngayHuy?: Date;
  @Column({
    type: DataType.ENUM(...Object.values(YeuCauBaoTriBaoDuongTrangThai)),
    defaultValue: YeuCauBaoTriBaoDuongTrangThai.MOI_TAO,
  })
  trangThai: YeuCauBaoTriBaoDuongTrangThai;
  @StrObjectId()
  _id: string;
}
