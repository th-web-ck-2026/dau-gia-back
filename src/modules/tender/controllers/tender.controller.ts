import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { TenderService } from '../services/tender.service';
import { CreateTenderSessionDto } from '../dto/create-tender-session.dto';
import { SubmitTenderProposalDto } from '../dto/submit-tender-proposal.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tender')
@Controller('tender-sessions')
export class TenderController {
  constructor(private readonly tenderService: TenderService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Tao phien dau thau moi' })
  async createSession(@ReqUser() user: AuthUser, @Body() dto: CreateTenderSessionDto) {
    return this.tenderService.createSession(user.id, dto);
  }

  @Post(':id/publish')
  @Auth()
  @ApiOperation({ summary: 'Cong bo phien dau thau' })
  async publishSession(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.tenderService.publishSession(user.id, id);
  }

  @Post('submissions')
  @Auth()
  @ApiOperation({ summary: 'Nop ho so de xuat' })
  async submitProposal(@ReqUser() user: AuthUser, @Body() dto: SubmitTenderProposalDto) {
    return this.tenderService.submitProposal(user.id, dto);
  }

  @Post(':id/evaluate')
  @Auth()
  @ApiOperation({ summary: 'Danh gia va xep hang ho so phien dau thau' })
  async evaluateSession(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.tenderService.evaluateSession(user.id, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lay chi tiet phien dau thau' })
  async getSessionDetails(@Param('id') id: string) {
    return this.tenderService.getSessionDetails(id);
  }

  @Get(':id/submissions')
  @Auth()
  @ApiOperation({ summary: 'Lay danh sach de xuat cua phien' })
  async getSessionSubmissions(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.tenderService.getSessionSubmissions(user.id, id);
  }
}
