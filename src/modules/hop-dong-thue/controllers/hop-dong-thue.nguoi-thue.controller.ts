import {
  Controller,
  Query,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Post,
  Body,
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
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { ConditionHopDongThueDto } from '../dto/condition-hop-dong-thue.dto';
@Auth(UserRoles.USER)
@Controller('hop-dong-thue/nguoi-thue')
@ApiTags('HopDongThue Nguoi Thue')
export class HopDongThueNguoiThueController {
  constructor(private readonly hopDongThueService: HopDongThueService) {}

  @Get('me/page')
  async nguoiThueGetPage(
    @ReqUser() user: AuthUser,
    @RequestCondition(ConditionHopDongThueDto)
    condition: ConditionHopDongThueDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.hopDongThueService.nguoiThueGetPage(user, condition, query);
  }
  @Get('me/:id')
  async nguoiThueGetOne(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.hopDongThueService.nguoiThueGetOne(user, id);
  }
  @Get('me/page/unit-thue')
  async nguoiThueGetPageUnitThue(
    @ReqUser() user: AuthUser,
    @RequestQuery() query: QueryOption,
  ) {
    return this.hopDongThueService.nguoiThueGetPageUnitThue(user, query);
  }
}
