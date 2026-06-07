import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { TenderSubmissionValue } from '../entities/tender-submission-value.entity';
import { TenderSubmissionModel } from './tender-submission.model';
import { TenderCriteriaModel } from './tender-criteria.model';

@Table({
  tableName: EntityTable.TENDER_SUBMISSION_VALUE,
  indexes: [
    {
      fields: ['deXuatId'],
    },
  ],
})
export class TenderSubmissionValueModel extends Model implements TenderSubmissionValue {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => TenderSubmissionModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  deXuatId: string;

  @BelongsTo(() => TenderSubmissionModel, {
    foreignKey: 'deXuatId',
    as: 'deXuat',
  })
  deXuat: TenderSubmissionModel;

  @ForeignKey(() => TenderCriteriaModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tieuChiId: string;

  @BelongsTo(() => TenderCriteriaModel, {
    foreignKey: 'tieuChiId',
    as: 'tieuChi',
  })
  tieuChi: TenderCriteriaModel;

  @Column({
    type: DataType.FLOAT,
  })
  giaTriSo?: number;

  @Column({
    type: DataType.STRING,
  })
  giaTriChuoi?: string;


  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  giaTriGoc: any;

  @Column({
    type: DataType.FLOAT,
  })
  diemChuanHoa?: number;

  @Column({
    type: DataType.FLOAT,
  })
  diemCoTrongSo?: number;
}
