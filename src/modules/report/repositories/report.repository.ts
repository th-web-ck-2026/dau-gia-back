import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Common/base/base.repository';
import { ReportModel } from '../models/report.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ReportRepository extends BaseRepository<ReportModel> {
  constructor(@InjectModel(ReportModel) private readonly reportModel: typeof ReportModel) {
    super(reportModel);
  }
}
