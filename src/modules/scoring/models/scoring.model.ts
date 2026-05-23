import { Table, Model } from 'sequelize-typescript';
import { Scoring } from "../entities/scoring.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";

@Table({
  tableName: EntityTable.SCORING,
})
export class ScoringModel extends Model implements Scoring {
  @StrObjectId()
  _id: string;
}
