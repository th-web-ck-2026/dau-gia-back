import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UnitService } from '../services/unit.service';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';
import { Auth } from '@Decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { ConditionUnitDto } from '../dto/condition-unit.dto';

@Auth(UserRoles.USER)
@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post('me')
  async create(
    @ReqUser() user: AuthUser,
    @Body() createUnitDto: CreateUnitDto,
  ) {
    return this.unitService.create({
      ...createUnitDto,
      userId: user.id,
    });
  }
  @Get('me/page')
  async getPage(
    @ReqUser() user: AuthUser,
    @RequestCondition(ConditionUnitDto) condition: ConditionUnitDto,
    @RequestQuery() query: QueryOption,
  ) {
    return this.unitService.getPage(
      {
        where: { ...condition, userId: user.id },
      },
      query,
    );
  }
  @Get('me/:id')
  async getById(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.unitService.getOne({
      where: { _id: id, userId: user.id },
    });
  }
  @Put('me/:id')
  async update(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitService.updateOne(updateUnitDto, {
      where: { _id: id, userId: user.id },
    });
  }
  @Delete('me/:id')
  async delete(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.unitService.deleteOne({
      where: { _id: id, userId: user.id },
    });
  }
}
