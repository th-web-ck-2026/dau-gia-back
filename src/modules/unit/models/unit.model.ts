import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Unit } from '../entities/unit.entity';
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from '@Common/constants/base.constant';
import { UnitTrangThaiThue, UnitType } from '../common/constant';
import { PropertieModel } from '@/modules/propertie/models/propertie.model';
import { UserModel } from '@/modules/user/models/user.model';
import { Propertie } from '@/modules/propertie/entities/propertie.entity';

@Table({
  tableName: EntityTable.UNIT,
  indexes: [
    {
      fields: ['code'],
      unique: true,
    },
    {
      fields: ['propertieId'],
    },
  ],
})
export class UnitModel extends Model implements Unit {
  @Column({
    unique: true,
  })
  code: string;
  @StrObjectId()
  _id: string;
  @Column
  @ForeignKey(() => UserModel)
  userId: string;
  @Column
  @ForeignKey(() => PropertieModel)
  propertieId: string;
  @BelongsTo(() => PropertieModel, {
    foreignKey: 'propertieId',
    onDelete: 'CASCADE',
  })
  propertie: Propertie;
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
