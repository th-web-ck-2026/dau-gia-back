import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { AuthProvider as AuthProviderEntity } from '../entities/auth-provider.entity';
import { AuthProvider as AuthProviderEnum, AUTH_PROVIDER_VALUES } from '../common/constants';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.AUTH_PROVIDER,
  indexes: [
    { unique: true, fields: ['userId', 'provider'] },
    { unique: true, fields: ['provider', 'providerId'] },
  ],
})
export class AuthProviderModel extends Model implements AuthProviderEntity {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => UserModel)
  @Column({ allowNull: false })
  userId: string;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @Column({
    type: DataType.ENUM(...AUTH_PROVIDER_VALUES),
    allowNull: false,
  })
  provider: AuthProviderEnum;

  @Column({ allowNull: false })
  providerId: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  credentials: string | null;

  @Column({ defaultValue: false })
  isVerified: boolean;
}
