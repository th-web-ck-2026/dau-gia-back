import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Bid } from '../entities/bid.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { BidStatus } from '../common/constant';
import { ClassModel } from '@/modules/class/models/class.model';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.BID,
})
export class BidModel extends Model implements Bid {
  @Column
  @ForeignKey(() => ClassModel)
  class_id: string;
  @BelongsTo(() => ClassModel, {
    foreignKey: 'class_id',
    targetKey: '_id',
    onDelete: 'CASCADE',
  })
  class: ClassModel;
  @Column
  @ForeignKey(() => UserModel)
  student_id: string;
  @BelongsTo(() => UserModel, {
    foreignKey: 'student_id',
    targetKey: '_id',
    onDelete: 'CASCADE',
  })
  student: UserModel;
  @Column
  bid_price: number;
  @Column
  message: string;
  @Column
  address: string;
  @Column({
    defaultValue: BidStatus.PENDING,
  })
  status: BidStatus;
  @StrObjectId()
  _id: string;
}
