import { PartialType, PickType } from '@nestjs/mapped-types';
import { YeuCauBaoTriBaoDuong } from '../entities/yeu-cau-bao-tri-bao-duong.entity';

export class ConditionYeuCauBaoTriBaoDuongDto extends PartialType(
  YeuCauBaoTriBaoDuong,
) {}
