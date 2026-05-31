import { Global, Module } from '@nestjs/common';
import { AuditLogModel } from './models/audit-log.model';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditLogService } from './services/audit-log.service';
import { AuditLogController } from './controllers/audit-log.controller';

@Global()
@Module({
  imports: [],
  controllers: [AuditLogController],
  providers: [AuditLogRepository, AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
