import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ConditionReportDto } from '../dto/condition-report.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportModel } from '../models/report.model';
import { RequestQuery } from '@Common/decorators/request-query.decorator';
import { QueryOption } from '@Common/pipe/query-option.interface';
import { PageableDto } from '@Common/dto/pageable.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'The report has been successfully created.', type: ReportModel })
  async create(@Body() createReportDto: CreateReportDto): Promise<ReportModel> {
    return this.reportService.createReport(createReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ status: 200, description: 'Returns all reports.', type: PageableDto })
  async findAll(
    @Query() condition: ConditionReportDto,
    @RequestQuery() options: QueryOption,
  ): Promise<PageableDto<ReportModel>> {
    return this.reportService.findAllReports(condition, options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  @ApiResponse({ status: 200, description: 'Returns the report with the specified ID.', type: ReportModel })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  async findOne(@Param('id') id: string): Promise<ReportModel> {
    return this.reportService.findReportById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a report by ID' })
  @ApiResponse({ status: 200, description: 'The report has been successfully updated.', type: ReportModel })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  async update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto): Promise<ReportModel> {
    return this.reportService.updateReport(id, updateReportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report by ID' })
  @ApiResponse({ status: 200, description: 'The report has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Report not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.reportService.deleteReport(id);
  }
}
