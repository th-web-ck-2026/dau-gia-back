import { Controller } from '@nestjs/common';
import { AuditLogService } from '../services/audit-log.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { ApiTags } from '@nestjs/swagger';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ApiGet } from '@/common/decorators/swagger';
import { AuditLog } from '../entities/audit-log.entity';
import { PageableDto } from '@/common/dto/pageable.dto';

@ApiTags('AuditLog')
@Controller('audit-logs')
@Auth(UserRoles.ADMIN)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @ApiGet({
    mode: 'page',
    summary: 'Lay danh sach nhat ky kiem toan (Admin only)',
    responseType: AuditLog,
  })
  async getLogs(
    @RequestQuery() query: QueryOption,
  ): Promise<PageableDto<AuditLog>> {
    return this.auditLogService.getPage({}, query);
  }
}
