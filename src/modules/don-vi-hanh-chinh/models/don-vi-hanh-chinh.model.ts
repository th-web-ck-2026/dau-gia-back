import { Table, Model, Column } from 'sequelize-typescript';
import { DonViHanhChinh } from "../entities/don-vi-hanh-chinh.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";

@Table({
  tableName: EntityTable.DON_VI_HANH_CHINH,
})
export class DonViHanhChinhModel extends Model implements DonViHanhChinh {
  @Column
  code: string;
  @Column
  name: string;
  @Column
  provinceCode: string;
  @Column
  level: number;
  @StrObjectId()
  _id: string;
}
