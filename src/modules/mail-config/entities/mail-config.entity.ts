import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";

export class MailConfig implements BaseEntity {
  @StrObjectId()
  _id: string;

  name: string;

  host: string;

  port: number;

  user: string;

  pass: string;

  is_active: boolean;
}
