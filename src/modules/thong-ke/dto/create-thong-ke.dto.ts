import { OmitType } from '@nestjs/swagger';
import { ThongKe } from '../entities/thong-ke.entity';

export class CreateThongKeDto extends OmitType(ThongKe, ['_id']) {
  
}
