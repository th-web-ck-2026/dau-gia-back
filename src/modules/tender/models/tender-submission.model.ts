import { Table, Column, DataType, Model, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { TenderSubmission } from '../entities/tender-submission.entity';
import { TrangThaiDeXuat } from '@/modules/scoring/common/constants';
import { TenderSessionModel } from './tender-session.model';
import { UserModel } from '@/modules/user/models/user.model';
import { TenderSubmissionValueModel } from './tender-submission-value.model';

@Table({
  tableName: EntityTable.TENDER_SUBMISSION,
  indexes: [
    {
      unique: true,
      fields: ['phienId', 'nguoiThamGiaId'],
    },
    {
      fields: ['nguoiThamGiaId'],
    },
  ],
})
export class TenderSubmissionModel extends Model implements TenderSubmission {
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

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nguoiThamGiaId: string;

  @BelongsTo(() => UserModel, {
    foreignKey: 'nguoiThamGiaId',
    as: 'nguoiThamGia',
  })
  nguoiThamGia: UserModel;

  @HasMany(() => TenderSubmissionValueModel, {
    foreignKey: 'deXuatId',
    as: 'giaTriTieuChi',
  })
  giaTriTieuChi: TenderSubmissionValueModel[];

  @Column({
    type: DataType.ENUM(...Object.values(TrangThaiDeXuat)),
    defaultValue: TrangThaiDeXuat.CHO_DUYET,
    allowNull: false,
  })
  trangThai: TrangThaiDeXuat;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  giaDeXuat: number;

  @Column({
    type: DataType.FLOAT,
  })
  diemKyThuat?: number;

  @Column({
    type: DataType.INTEGER,
  })
  thuHang?: number;

  @Column({
    type: DataType.TEXT,
  })
  lyDoTuChoi?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  thoiDiemNop: Date;
}
