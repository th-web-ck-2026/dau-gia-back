import { EntityTable } from '@/common/constants/entity.constant';
import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { User } from '../entities/user.entity';
import { Gender, UserRoles, UserStatus } from '../common/constant';
import { StrObjectId } from '@/common/constants/base.constant';
import * as bcrypt from 'bcrypt';
import { VerifyLever } from '@/modules/tutor-verification/common/constant';
@Table({
  tableName: EntityTable.USER,
})
export class UserModel extends Model implements User {
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
  password: string;

  @Column
  birthday?: string;
  @Column
  avatar?: string;
  @Column
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

  @Column({
    type: DataType.ENUM(...Object.values(VerifyLever)),
    allowNull: false,
    defaultValue: VerifyLever.NONE,
  })
  verifyLever: VerifyLever;
  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
