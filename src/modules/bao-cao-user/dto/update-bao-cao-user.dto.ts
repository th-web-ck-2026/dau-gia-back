import { PartialType } from '@nestjs/swagger';
import { CreateBaoCaoUserDto } from './create-bao-cao-user.dto';

export class UpdateBaoCaoUserDto extends PartialType(CreateBaoCaoUserDto) {}
