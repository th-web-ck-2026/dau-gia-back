import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { AdminAiService } from '../services/admin-ai.service';
import { AuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { UserRoles } from '@/modules/user/common/constant';
import { Auth } from '@/common/decorators/auth.decorator';
import { GenerateFlowDto } from '../dto/generate-flow.dto';

@Controller('admin/ai')
@UseGuards(AuthGuard, RolesGuard)
@Auth(UserRoles.ADMIN)
export class AdminAiController {
  constructor(private readonly adminAiService: AdminAiService) {}

  @Post('generate-flow')
  async generateFullFlow(@Body() generateFlowDto: GenerateFlowDto) {
    return this.adminAiService.generateFullFlow(generateFlowDto.quantity);
  }
}
