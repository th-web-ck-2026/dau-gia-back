import { EntityTable } from '@/common/constants/entity.constant';
import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { User } from '../entities/user.entity';
import { Gender, UserRoles, UserRoleType, UserStatus } from '../common/constant';
import { StrObjectId } from '@/common/constants/base.constant';
@Table({
  tableName: EntityTable.USER,
})
export class UserModel extends Model implements User {
  @Column({
    type: DataType.ENUM(...Object.values(UserRoleType)),
  })
  userRoles: UserRoleType;

  @StrObjectId()
  _id: string;
  @Column
  fullname: string;
  @Column({
    unique: true,
  })
  email: string;
  @Column({
    unique: true,
  })
  phone: string;

  @Column
  birthday?: string;
  @Column
  avatar?: string;
  @Column({
    type: DataType.ENUM(...Object.values(UserRoles)),
    defaultValue: UserRoles.USER,
  })
  role: UserRoles;
  @Column
  gender?: Gender;

  @Column
  provinceId?: string;
  @Column
  districtId?: string;
  @Column
  wardId?: string;
  @Column
  address?: string;
  @Column({
    defaultValue: false,
  })
  isVerified?: boolean;
  @Column({
    defaultValue: UserStatus.ACTIVE,
  })
  userStatus?: UserStatus;

  @Column
  soCccd?: string;
  @Column
  ngayCapCccd?: string;
  @Column
  noiCapCccd?: string;

}
