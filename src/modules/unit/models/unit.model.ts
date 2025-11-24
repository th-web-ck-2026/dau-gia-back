import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { Unit } from "../entities/unit.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";
import { UnitTrangThaiThue, UnitType } from '../common/constant';

@Table({
  tableName: EntityTable.UNIT,
})
export class UnitModel extends Model implements Unit {
  @StrObjectId()
  _id: string;
  @Column
  propertieId: string;
  @Column
  ten: string;
  @Column
  moTa: string;
  @Column({
    type: DataType.ENUM(...Object.values(UnitType)),
  })
  type: UnitType;
  @Column({
    type: DataType.ENUM(...Object.values(UnitTrangThaiThue)),
    defaultValue: UnitTrangThaiThue.TRONG,
  })
  trangThaiThue: UnitTrangThaiThue;
}
