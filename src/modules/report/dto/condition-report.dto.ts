import {  PartialType } from '@nestjs/swagger';
import { Report } from '../entities/report.entity';

export class ConditionReportDto extends PartialType(Report) {}
