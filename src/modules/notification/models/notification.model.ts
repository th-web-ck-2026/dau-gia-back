import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { Notification } from '../entities/notification.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { NotificationType } from '../common/constant';

@Table({
  tableName: EntityTable.NOTIFICATION,
})
export class NotificationModel extends Model implements Notification {
  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  userIds: string[];
  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
  })
  type: NotificationType;
  @Column
  title: string;
  @Column
  content: string;
  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  userReadIds: string[];
  @StrObjectId()
  _id: string;
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata?: Record<string, any>;
}
