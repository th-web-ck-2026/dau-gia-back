import { Table, Model, Column, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { HopDongThue } from "../entities/hop-dong-thue.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";
import { DongThueTheo, HopDongTrangThai } from '../common/constant';
import { DichVuThue } from '../dto/dich-vu-thue.dto';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { UserModel } from '@/modules/user/models/user.model';
import { User } from '@/modules/user/entities/user.entity';
import { Unit } from '@/modules/unit/entities/unit.entity';

@Table({
  tableName: EntityTable.HOP_DONG_THUE,
})
export class HopDongThueModel extends Model implements HopDongThue {
  @ForeignKey(() => UserModel)
  @Column
  userId: string;
  @Column
  @ForeignKey(() => UnitModel)
  unitId: string;
  @BelongsTo(() => UnitModel)
  unit: Unit;
  @Column
  @ForeignKey(() => UserModel)
  khachHangUserId: string;
  @BelongsTo(() => UserModel)
  khachHangUser: User;
  @Column
  ngayBatDauThue: Date;
  @Column
  ngayKetThucThue: Date;
  @Column
  giaThue: number;
  @Column({
    type: DataType.ENUM(...Object.values(DongThueTheo)),
  })
  dongThueTheo: DongThueTheo;
  @Column
  chuKyDongThue: number;
  @Column
  soThangThue: number;
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  dichVuThues: DichVuThue[];
  @Column({
    allowNull: true,
  })
  ghiChu: string;
  @Column({
    type: DataType.ENUM(...Object.values(HopDongTrangThai)),
    defaultValue: HopDongTrangThai.CHO_XAC_NHAN,
  })
  trangThai: HopDongTrangThai;
  @StrObjectId()
  _id: string;
}
