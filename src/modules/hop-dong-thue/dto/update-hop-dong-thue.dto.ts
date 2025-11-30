import { PartialType } from '@nestjs/mapped-types';
import { CreateHopDongThueDto } from './create-hop-dong-thue.dto';

export class UpdateHopDongThueDto extends PartialType(CreateHopDongThueDto) {}
