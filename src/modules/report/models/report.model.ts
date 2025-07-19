import { Table, Model, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Report } from "../entities/report.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";
import { UserModel } from '@Modules/user/models/user.model';
import { ClassModel } from '@Modules/class/models/class.model';

@Table({
  tableName: EntityTable.REPORT,
})
export class ReportModel extends Model implements Report {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => UserModel)
  @Column
  reporterId: string;

  @BelongsTo(() => UserModel, 'reporterId')
  reporter: UserModel;

  @ForeignKey(() => UserModel)
  @Column
  reportedUserId: string;

  @BelongsTo(() => UserModel, 'reportedUserId')
  reportedUser: UserModel;

  @ForeignKey(() => ClassModel)
  @Column({ allowNull: true })
  classId?: string;

  @BelongsTo(() => ClassModel, 'classId')
  class?: ClassModel;

  @Column
  reason: string;

  @Column({ defaultValue: 'pending' })
  status: string;
}
