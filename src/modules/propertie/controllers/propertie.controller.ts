import {
  Controller,
  Query,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PropertieService } from '../services/propertie.service';
import { CreatePropertieDto } from '../dto/create-propertie.dto';
import { UpdatePropertieDto } from '../dto/update-propertie.dto';
import { Auth } from '@Decorators/auth.decorator';
import { Public } from '@Decorators/public.decorator';
import { ApiError } from '@Exceptions/api-error';
import { UserRoles } from '@/modules/user/common/constant';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ReqUser } from '@/common/decorators/user.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';

@Auth(UserRoles.USER)
@Controller('propertie')
export class PropertieController {
  constructor(private readonly propertieService: PropertieService) {}
  @Post('me')
  async create(
    @ReqUser() user: AuthUser,
    @Body() createPropertieDto: CreatePropertieDto,
  ) {
    return this.propertieService.create({
      ...createPropertieDto,
      userId: user.id,
    });
  }
  @Get('me/page')
  async getPage(@ReqUser() user: AuthUser, @Query() query: QueryOption) {
    return this.propertieService.getPage(
      {
        where: {
          userId: user.id,
        },
      },
      query,
    );
  }
  @Get('me/:id')
  async getById(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.propertieService.getOne({
      where: {
        _id: id,
        userId: user.id,
      },
    });
  }
  @Put('me/:id')
  async update(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updatePropertieDto: UpdatePropertieDto,
  ) {
    return this.propertieService.updateOne(updatePropertieDto, {
      where: { _id: id, userId: user.id },
    });
  }
  @Delete('me/:id')
  async delete(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.propertieService.deleteOne({
      where: { _id: id, userId: user.id },
    });
  }
}
