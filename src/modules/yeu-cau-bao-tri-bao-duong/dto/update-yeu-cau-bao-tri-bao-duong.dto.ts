import { PartialType } from '@nestjs/mapped-types';
import { CreateYeuCauBaoTriBaoDuongDto } from './create-yeu-cau-bao-tri-bao-duong.dto';

export class UpdateYeuCauBaoTriBaoDuongDto extends PartialType(
  CreateYeuCauBaoTriBaoDuongDto,
) {}
