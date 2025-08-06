import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { TutorVerification } from '../entities/tutor-verification.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { User } from '@/modules/user/entities/user.entity';
import { VerifyLever, VerifyStatus } from '../common/constant';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.TUTOR_VERIFICATION,
})
export class TutorVerificationModel extends Model implements TutorVerification {
  @StrObjectId()
  _id: string;
  @Column
  @ForeignKey(() => UserModel)
  tutor_id: string;
  @BelongsTo(() => UserModel, {
    foreignKey: 'tutor_id',
    targetKey: '_id',
    onDelete: 'CASCADE',
  })
  tutor?: User;

  @Column
  cccd_front?: string;
  @Column
  cccd_back?: string;
  @Column
  face?: string;
  
  @Column({
    type: DataType.ENUM(...Object.values(VerifyLever)),
    allowNull: false,
    defaultValue: VerifyLever.NONE,
  })
  verifyLever: VerifyLever;
  @Column({
    type: DataType.ENUM(...Object.values(VerifyStatus)),
    allowNull: false,
    defaultValue: VerifyStatus.PENDING,
  })
  status: VerifyStatus;
  @Column
  meeting_time?: string;
  @Column
  meeting_url?: string;
  @Column
  verify_at?: Date;
  @Column
  note?: string;
  @Column
  reason?: string;
}
