import { 
  Controller, 
  Query,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Post,
  Body
} from '@nestjs/common';
import { HopDongThueService } from '../services/hop-dong-thue.service';
import { CreateHopDongThueDto } from '../dto/create-hop-dong-thue.dto';
import { UpdateHopDongThueDto } from '../dto/update-hop-dong-thue.dto';
import { Auth } from '@Decorators/auth.decorator';
import { Public } from '@Decorators/public.decorator';
import { ApiError } from '@Exceptions/api-error';
import { ApiTags } from '@nestjs/swagger';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { UnitModel } from '@/modules/unit/models/unit.model';
import { UserRoles } from '@/modules/user/common/constant';
@Auth(UserRoles.USER)
@Controller('hop-dong-thue/nguoi-cho-thue')
@ApiTags('HopDongThue Nguoi Cho Thue')
export class HopDongThueNguoiChoThueController {
  constructor(private readonly hopDongThueService: HopDongThueService) {}

  @Get('me/page')
  async nguoiChoThueGetPage(
    @ReqUser() user: AuthUser,
    @RequestQuery() query: QueryOption,
  ) {
    return this.hopDongThueService.nguoiChoThueGetPage(user, query);
  }
  @Get('me/:id')
  async nguoiChoThueGetById(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.hopDongThueService.getOne({
      where: { _id: id},
      include: [
        {
          model: UnitModel,
          where: { userId: user.id },
          required: true,
        },
      ],
    });
  }
  @Post('me')
  async nguoiChoThueCreate(
    @ReqUser() user: AuthUser,
    @Body() createHopDongThueDto: CreateHopDongThueDto,
  ) {
    return this.hopDongThueService.createHopDongThue(user, createHopDongThueDto);
  }
}
