import { Table, Model, Column, DataType, ForeignKey } from 'sequelize-typescript';
import { Propertie } from "../entities/propertie.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";
import { PropertieType } from '../common/constant';
import { UserModel } from '@/modules/user/models/user.model';

@Table({
  tableName: EntityTable.PROPERTIE,
})
export class PropertieModel extends Model implements Propertie {
  @Column
  @ForeignKey(() => UserModel)
  userId: string;
  @Column({
    unique: true,
  })
  code: string;
  @Column
  ten: string;
  @Column({
    type: DataType.ENUM(...Object.values(PropertieType)),
  })
  type: PropertieType;
  @Column
  tinhThanhPho: string;
  @Column
  diaChi: string;
  @Column
  moTa: string;
  @StrObjectId()
  _id: string;
}
