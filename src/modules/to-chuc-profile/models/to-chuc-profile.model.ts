import { Table, Model, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ToChucProfile } from "../entities/to-chuc-profile.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";
import { UserModel } from '@/modules/user/models/user.model';
import { User } from '@/modules/user/entities/user.entity';

@Table({
  tableName: EntityTable.TO_CHUC_PROFILE,
})
export class ToChucProfileModel extends Model implements ToChucProfile {
  @Column
  @ForeignKey(() => UserModel)
  userId: string;
  @BelongsTo(() => UserModel, {
    foreignKey: 'userId',
    
  })
  user: User;
  @Column
  tenToChuc: string;
  @Column
  maSoThue: string;
  @Column
  soDienThoai: string;
  @Column
  email: string;
  @Column
  tenTinhTp?: string;
  @Column
  maTinhTp?: string;
  @Column
  tenXaPhuong?: string;
  @Column
  maXaPhuong?: string;
  @Column
  diaChi?: string;
  @StrObjectId()
  _id: string;
}
