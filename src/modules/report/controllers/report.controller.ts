import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ConditionReportDto } from '../dto/condition-report.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportModel } from '../models/report.model';
import { RequestQuery } from '@Common/decorators/request-query.decorator';
import { QueryOption } from '@Common/pipe/query-option.interface';
import { PageableDto } from '@Common/dto/pageable.dto';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { Roles } from '@/common/decorators/roles.decorator';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';

@Auth(UserRoles.ADMIN)
@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(UserRoles.STUDENT, UserRoles.TUTOR)
  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  async create(
    @ReqUser() user: AuthUser,
    @Body() createReportDto: CreateReportDto,
  ): Promise<ReportModel> {
    return this.reportService.createReport(user, createReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  async findAll(
    @RequestCondition(ConditionReportDto) condition: ConditionReportDto,
    @RequestQuery() options: QueryOption,
  ): Promise<PageableDto<ReportModel>> {
    return this.reportService.findAllReports(condition, options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  async findOne(@Param('id') id: string): Promise<ReportModel> {
    return this.reportService.findReportById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a report by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<ReportModel> {
    return this.reportService.updateReport(id, updateReportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report by ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.reportService.deleteReport(id);
  }
}
