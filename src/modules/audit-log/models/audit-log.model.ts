import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { AuditLog } from '../entities/audit-log.entity';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.AUDIT_LOG,
})
export class AuditLogModel extends Model implements AuditLog {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING,
  })
  nguoiThucHienId?: string;

  @BelongsTo(() => UserModel, {
    foreignKey: 'nguoiThucHienId',
    as: 'nguoiThucHien',
  })
  nguoiThucHien?: UserModel;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  hanhDong: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  loaiDoiTuong: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  doiTuongId: string;

  @Column({
    type: DataType.JSONB,
  })
  truocKhi?: any;

  @Column({
    type: DataType.JSONB,
  })
  sauKhi?: any;

  @Column({
    type: DataType.JSONB,
  })
  duLieuBoSung?: any;
}
