import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DanhMuc } from '../entities/danh-muc.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { LoaiDanhMucModel } from './loai-danh-muc.model';

@Table({
  tableName: EntityTable.DANH_MUC,
})
export class DanhMucModel extends Model implements DanhMuc {
  @StrObjectId()
  _id: string;

  @ForeignKey(() => LoaiDanhMucModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  maLoai: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ten: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  anh?: string;

  @BelongsTo(() => LoaiDanhMucModel, {
    foreignKey: 'maLoai',
    targetKey: 'ma',
    as: 'loaiDanhMuc',
  })
  loaiDanhMuc: LoaiDanhMucModel;
}
