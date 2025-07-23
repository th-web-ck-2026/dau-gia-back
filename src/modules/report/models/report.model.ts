import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Report } from '../entities/report.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { UserModel } from '@Modules/user/models/user.model';
import { ReportReason, ReportStatus } from '../common/constant';

@Table({
  tableName: EntityTable.REPORT,
})
export class ReportModel extends Model implements Report {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => UserModel)
  @Column
  reporterId: string;

  @BelongsTo(() => UserModel, {
    foreignKey: 'reporterId',
    targetKey: '_id',
    onDelete: 'CASCADE',
  })
  reporter: UserModel;

  @ForeignKey(() => UserModel)
  @Column
  reportedUserId: string;

  @BelongsTo(() => UserModel, {
    foreignKey: 'reportedUserId',
    targetKey: '_id',
    onDelete: 'CASCADE',
  })
  reportedUser: UserModel;

  @Column({
    type: DataType.ENUM(...Object.values(ReportReason)),
  })
  reason: ReportReason;
  @Column({
    type: DataType.TEXT,
  })
  description: string;
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  admin_note?: string;

  @Column({
    type: DataType.ENUM(...Object.values(ReportStatus)),
    defaultValue: ReportStatus.PENDING,
  })
  status: ReportStatus;
}
