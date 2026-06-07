import { Controller, Post, Body } from '@nestjs/common';
import { AuditLogService } from '../services/audit-log.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';
import { ApiTags, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ApiGet } from '@/common/decorators/swagger';
import { AuditLog } from '../entities/audit-log.entity';
import { PageableDto } from '@/common/dto/pageable.dto';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';

import { UserModel } from '@/modules/user/models/user.model';

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
    return this.auditLogService.getPage({
      include: [
        { model: UserModel, as: 'nguoiThucHien' }
      ]
    }, query);
  }

  @Post()
  @ApiOperation({ summary: 'Tao nhat ky kiem toan thu cong' })
  @ApiCreatedResponse({ type: AuditLog })
  async createLog(
    @Body() dto: CreateAuditLogDto,
  ): Promise<AuditLog> {
    return this.auditLogService.create(dto);
  }
}
