import { Table, Model } from 'sequelize-typescript';
import { ThongKe } from "../entities/thong-ke.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";

@Table({
  tableName: EntityTable.THONG_KE,
})
export class ThongKeModel extends Model implements ThongKe {
  @StrObjectId()
  _id: string;
}
