import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from "../entities/tenant.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";
import { TenantTrangThai } from '../common/constant';
import { UserModel } from '@/modules/user/models/user.model';
import { User } from '@/modules/user/entities/user.entity';
import { HopDongThueModel } from '@/modules/hop-dong-thue/models/hop-dong-thue.model';
import { HopDongThue } from '@/modules/hop-dong-thue/entities/hop-dong-thue.entity';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { Unit } from '@/modules/unit/entities/unit.entity';

@Table({
  tableName: EntityTable.TENANT,
})
export class TenantModel extends Model implements Tenant {
  @Column
  @ForeignKey(() => HopDongThueModel)
  hopDongThueId: string;
  @BelongsTo(() => HopDongThueModel, {
    foreignKey: 'hopDongThueId',
    onDelete: 'CASCADE',
  })
  hopDongThue: HopDongThue;
  @Column
  code: string;
  @Column
  @ForeignKey(() => UserModel)
  khachHangUserId: string;
  @BelongsTo(() => UserModel)
  khachHangUser: User;
  @Column({
    type: DataType.ENUM(...Object.values(TenantTrangThai)),
    defaultValue: TenantTrangThai.CHO_XAC_NHAN,
  })
  trangThai: TenantTrangThai;
  @StrObjectId()
  _id: string;
}
