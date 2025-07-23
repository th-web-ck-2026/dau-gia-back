import { Injectable } from '@nestjs/common';
import { BaseService } from '@Common/base/base.service';
import { ReportModel } from '../models/report.model';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ConditionReportDto } from '../dto/condition-report.dto';
import { QueryOption } from '@Common/pipe/query-option.interface';
import { PageableDto } from '@Common/dto/pageable.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ReportStatus } from '../common/constant';
import { ApiError } from '@/common/exceptions/api-error';
import { UserRepository } from '@/modules/user/repositories/user.repository';

@Injectable()
export class ReportService extends BaseService<ReportModel> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
  ) {
    super(reportRepository);
  }

  async createReport(
    user: AuthUser,
    createReportDto: CreateReportDto,
  ): Promise<ReportModel> {
    const reportData = {
      ...createReportDto,
      reporterId: user.id,
    };
    // const reporterUser = this.userRepository.getOne({
    //   where: {
    //     _id: reportData.reporterId,
    //   },
    // });
    const reportedUser = this.userRepository.getOne({
      where: {
        _id: reportData.reportedUserId,
      },
    });
    if (!reportedUser) {
      throw ApiError.NotFound('Người bị báo cáo không tồn tại.');
    }
    const report = await this.reportRepository.getOne({
      where: {
        reporterId: reportData.reporterId,
        reportedUserId: reportData.reportedUserId,
      },
      attributes: ['status'],
    });
    // console.log("DATA: ", reportData)
    if (report && report.status === ReportStatus.PENDING) {
      throw ApiError.BadRequest(
        'Người dùng này đã được bạn báo cáo. Đơn báo cáo của bạn đang được xử lý.',
      );
    }
    return this.reportRepository.create(reportData);
  }

  async findAllReports(
    condition: any,
    options?: QueryOption,
  ): Promise<PageableDto<ReportModel>> {
    return this.reportRepository.getPage(condition, options);
  }

  async findReportById(id: string): Promise<ReportModel> {
    return this.reportRepository.getById(id);
  }

  async updateReport(
    id: string,
    updateReportDto: UpdateReportDto,
  ): Promise<ReportModel> {
    return this.reportRepository.updateOne(updateReportDto, {
      where: { _id: id },
    });
  }

  async deleteReport(id: string): Promise<ReportModel> {
    return this.reportRepository.deleteOne({ where: { _id: id } });
  }
}
