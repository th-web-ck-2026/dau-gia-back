import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { LoaiDanhMuc } from '../entities/loai-danh-muc.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { DanhMucModel } from './danh-muc.model';

@Table({
  tableName: EntityTable.LOAI_DANH_MUC,
})
export class LoaiDanhMucModel extends Model implements LoaiDanhMuc {
  @StrObjectId()
  _id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ten: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  ma: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isDefault: boolean;

  @HasMany(() => DanhMucModel, {
    foreignKey: 'maLoai',
    sourceKey: 'ma',
    as: 'danhMucs',
  })
  danhMucs: DanhMucModel[];
}
