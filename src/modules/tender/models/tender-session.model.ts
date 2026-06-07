import { Table, Column, DataType, Model, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { EntityTable } from '@/common/constants/entity.constant';
import { StrObjectId } from '@/common/constants/base.constant';
import { TenderSession } from '../entities/tender-session.entity';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { UserModel } from '@/modules/user/models/user.model';
import { TenderSubmissionModel } from './tender-submission.model';
import { TenderCriteriaModel } from './tender-criteria.model';

@Table({
  tableName: EntityTable.TENDER_SESSION,
  indexes: [
    {
      fields: ['chuPhienId'],
    },
  ],
})
export class TenderSessionModel extends Model implements TenderSession {
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  danhSachHinhAnh: string[];
  @StrObjectId()
  _id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tieuDe: string;

  @Column({
    type: DataType.TEXT,
  })
  moTa?: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  chuPhienId: string;

  @BelongsTo(() => UserModel, {
    foreignKey: 'chuPhienId',
    as: 'chuPhien',
  })
  chuPhien: UserModel;

  @Column({
    type: DataType.ENUM(...Object.values(TrangThaiPhien)),
    defaultValue: TrangThaiPhien.NHAP,
    allowNull: false,
  })
  trangThai: TrangThaiPhien;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  thoiGianBatDau: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  thoiGianKetThuc: Date;


  @Column({
    type: DataType.FLOAT,
    defaultValue: 50,
    allowNull: false,
  })
  diemKyThuatToiThieu: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  anDanh: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  soLuongNguoiThamGia: number;

  @Column({
    type: DataType.DATE,
  })
  thoiDiemCongBo?: Date;

  @Column({
    type: DataType.DATE,
  })
  thoiDiemDong?: Date;

  @ForeignKey(() => TenderSubmissionModel)
  @Column({
    type: DataType.STRING,
  })
  deXuatThangId?: string;

  @BelongsTo(() => TenderSubmissionModel, {
    foreignKey: 'deXuatThangId',
    as: 'deXuatThang',
  })
  deXuatThang?: TenderSubmissionModel;

  @HasMany(() => TenderCriteriaModel, {
    foreignKey: 'phienId',
    as: 'tieuChi',
  })
  tieuChi: TenderCriteriaModel[];
}
