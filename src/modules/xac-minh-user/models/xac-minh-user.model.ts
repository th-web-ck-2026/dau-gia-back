import { Table, Model } from 'sequelize-typescript';
import { XacMinhUser } from "../entities/xac-minh-user.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";

@Table({
  tableName: EntityTable.XAC_MINH_USER,
})
export class XacMinhUserModel extends Model implements XacMinhUser {
  @StrObjectId()
  _id: string;
}
