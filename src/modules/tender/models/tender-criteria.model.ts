import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { TenderCriteria } from '../entities/tender-criteria.entity';
import { LoaiTieuChi, HuongToiUu } from '@/modules/scoring/common/constants';
import { TenderSessionModel } from './tender-session.model';

@Table({
  tableName: EntityTable.TENDER_CRITERIA,
  indexes: [
    {
      fields: ['phienId'],
    },
  ],
})
export class TenderCriteriaModel extends Model implements TenderCriteria {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => TenderSessionModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phienId: string;

  @BelongsTo(() => TenderSessionModel, {
    foreignKey: 'phienId',
    as: 'phien',
  })
  phien: TenderSessionModel;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tenTieuChi: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  maTieuChi: string;


  @Column({
    type: DataType.ENUM(...Object.values(LoaiTieuChi)),
    allowNull: false,
  })
  loai: LoaiTieuChi;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  trongSo: number;

  @Column({
    type: DataType.ENUM(...Object.values(HuongToiUu)),
    allowNull: false,
  })
  huongToiUu: HuongToiUu;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  batBuoc: boolean;
  @Column({
    type: DataType.JSON,
  })
  cacLuaChon?: Array<{ nhan: string; giaTri: number }>;

  @Column({
    type: DataType.FLOAT,
  })
  giaTriToiThieu?: number;

  @Column({
    type: DataType.FLOAT,
  })
  giaTriToiDa?: number;

  @Column({
    type: DataType.STRING,
  })
  donVi?: string;
}
