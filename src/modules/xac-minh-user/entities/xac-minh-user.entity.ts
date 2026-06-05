import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";

export class XacMinhUser implements BaseEntity {
  @StrObjectId()
  _id: string;
}
