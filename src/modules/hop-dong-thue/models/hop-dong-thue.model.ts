import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { HopDongThue } from '../entities/hop-dong-thue.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { DongThueTheo, HopDongTrangThai } from '../common/constant';
import { DichVuThue } from '../dto/dich-vu-thue.dto';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { UserModel } from '@/modules/user/models/user.model';
import { User } from '@/modules/user/entities/user.entity';
import { Unit } from '@/modules/unit/entities/unit.entity';
import { KyThanhToanModel } from './ky-thanh-toan.model';
import { KyThanhToan } from '../entities/ky-thanh-toan.entity';

@Table({
  tableName: EntityTable.HOP_DONG_THUE,
  indexes: [
    {
      fields: ['code'],
      unique: true,
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['unitId'],
    },
    {
      fields: ['khachHangUserId'],
    },
  ],
})
export class HopDongThueModel extends Model implements HopDongThue {
  @Column
  code: string;
  @Column({
    allowNull: true,
  })
  tienDatCoc?: number;
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  hinhAnh?: string[];
  @ForeignKey(() => UserModel)
  @Column
  userId: string;
  @BelongsTo(() => UserModel, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  })
  user: User;
  @Column
  @ForeignKey(() => UnitModel)
  unitId: string;
  @BelongsTo(() => UnitModel)
  unit: Unit;
  @Column
  @ForeignKey(() => UserModel)
  khachHangUserId: string;
  @BelongsTo(() => UserModel, {
    foreignKey: 'khachHangUserId',
    onDelete: 'CASCADE',
  })
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
  @Column({
    type: DataType.TEXT,
  })
  dieuKhoanDichVu?: string;
  @Column({
    allowNull: true,
  })
  cccdKhachHang?: string;
  @Column({
    allowNull: true,
  })
  anhCccdKhachHangTruoc?: string;

  @Column({
    allowNull: true,
  })
  anhCccdKhachHangSau?: string;

  @HasMany(() => KyThanhToanModel, {
    foreignKey: 'hopDongThueId',
    sourceKey: '_id',
  })
  kyThanhToans: KyThanhToan[];

  @StrObjectId()
  _id: string;
}
