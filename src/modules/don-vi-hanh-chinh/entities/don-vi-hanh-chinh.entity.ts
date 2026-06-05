import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";

export class DonViHanhChinh implements BaseEntity {
  @StrObjectId()
  _id: string;
  code: string;
  name: string;
  provinceCode: string;
  level: number;
}
