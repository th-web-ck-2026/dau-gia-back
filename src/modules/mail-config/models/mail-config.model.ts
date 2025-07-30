import { Table, Model, Column, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { MailConfig } from "../entities/mail-config.entity";
import { EntityTable } from '@Common/constants/entity.constant';
import { StrObjectId } from "@Common/constants/base.constant";

@Table({
  tableName: EntityTable.MAIL_CONFIG,
})
export class MailConfigModel extends Model implements MailConfig {
  @StrObjectId()
  _id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  host: string;

  @Column(DataType.INTEGER)
  port: number;

  @Column(DataType.STRING)
  user: string;

  @Column(DataType.STRING)
  pass: string;

  @Column(DataType.BOOLEAN)
  is_active: boolean;
}
