import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/base/base.repository';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditLogModel } from '../models/audit-log.model';

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super(AuditLogModel);
  }
}
