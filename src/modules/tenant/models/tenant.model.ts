import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tenant } from "../entities/tenant.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";
import { TenantTrangThai } from '../common/constant';
import { UserModel } from '@/modules/user/models/user.model';
import { User } from '@/modules/user/entities/user.entity';

@Table({
  tableName: EntityTable.TENANT,
})
export class TenantModel extends Model implements Tenant {
  @Column
  code: string;
  @Column
  unitId: string;
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
