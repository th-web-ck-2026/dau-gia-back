import { PartialType } from '@nestjs/swagger';
import { CreateXacMinhUserDto } from './create-xac-minh-user.dto';

export class UpdateXacMinhUserDto extends PartialType(CreateXacMinhUserDto) {}
