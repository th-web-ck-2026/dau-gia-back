import { Injectable } from '@nestjs/common';
import { BaseService } from '@Common/base/base.service';
import { ReportModel } from '../models/report.model';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ConditionReportDto } from '../dto/condition-report.dto';
import { QueryOption } from '@Common/pipe/query-option.interface';
import { PageableDto } from '@Common/dto/pageable.dto';

@Injectable()
export class ReportService extends BaseService<ReportModel> {
  constructor(private readonly reportRepository: ReportRepository) {
    super(reportRepository);
  }

  async createReport(createReportDto: CreateReportDto): Promise<ReportModel> {
    return this.repository.create(createReportDto);
  }

  async findAllReports(condition: ConditionReportDto, options?: QueryOption): Promise<PageableDto<ReportModel>> {
    return this.repository.getPage(condition, options);
  }

  async findReportById(id: string): Promise<ReportModel> {
    return this.repository.getById(id);
  }

  async updateReport(id: string, updateReportDto: UpdateReportDto): Promise<ReportModel> {
    return this.repository.updateOne(updateReportDto, { where: { _id: id } });
  }

  async deleteReport(id: string): Promise<ReportModel> {
    return this.repository.deleteOne({ where: { _id: id } });
  }
}
