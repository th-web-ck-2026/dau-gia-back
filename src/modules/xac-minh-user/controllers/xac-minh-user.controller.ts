import { 
  Controller, 
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { XacMinhUserService } from '../services/xac-minh-user.service';
import { CreateXacMinhUserDto } from '../dto/create-xac-minh-user.dto';
import { UpdateXacMinhUserDto } from '../dto/update-xac-minh-user.dto';
import { Auth } from '@Decorators/auth.decorator';
import { Public } from '@Decorators/public.decorator';
import { ApiError } from '@Exceptions/api-error';

@Controller('xac-minh-user')
export class XacMinhUserController {
  constructor(private readonly xacMinhUserService: XacMinhUserService) {}

}
