import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { KyThanhToanTrangThai } from '../common/constant';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { KyThanhToan } from '../entities/ky-thanh-toan.entity';
import { HopDongThueModel } from './hop-dong-thue.model';
import { HopDongThue } from '../entities/hop-dong-thue.entity';
import { EntityTable } from '@Common/constants/entity.constant';

@Table({
  tableName: EntityTable.KY_THANH_TOAN,
  indexes: [
    {
      fields: ['hopDongThueId'],
    },
  ],
})
export class KyThanhToanModel extends Model implements KyThanhToan {
  @StrObjectId()
  _id: string;
  @ForeignKey(() => HopDongThueModel)
  @Column
  hopDongThueId: string;
  @BelongsTo(() => HopDongThueModel, {
    foreignKey: 'hopDongThueId',
    onDelete: 'CASCADE',
  })
  hopDongThue: HopDongThue;

  @Column
  ten: string;

  @Column
  ngayBatDauThanhToan: Date;
  @Column
  ngayKetThucThanhToan: Date;

  @Column({
    type: DataType.ENUM(...Object.values(KyThanhToanTrangThai)),
    defaultValue: KyThanhToanTrangThai.CHUA_BAT_DAU,
  })
  trangThai: KyThanhToanTrangThai;
  @Column({
    allowNull: true,
  })
  ghiChu?: string;
}
