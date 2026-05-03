import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { AuthSession as AuthSessionEntity, DeviceInfo } from '../entities/auth-session.entity';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.AUTH_SESSION,
  indexes: [
    { fields: ['userId'] },
    { unique: true, fields: ['refreshToken'] },
    { fields: ['expiresAt'] },
  ],
})
export class AuthSessionModel extends Model implements AuthSessionEntity {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => UserModel)
  @Column({ allowNull: false })
  userId: string;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @Column({ allowNull: false, unique: true })
  refreshToken: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  deviceInfo: DeviceInfo;

  @Column({ allowNull: false })
  ipAddress: string;

  @Column({ allowNull: false })
  expiresAt: Date;

  @Column({ allowNull: false })
  lastActiveAt: Date;
}
