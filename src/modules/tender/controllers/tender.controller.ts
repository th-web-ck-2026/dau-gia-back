import { Controller, Post, Body, Param, Get, Put, Delete } from '@nestjs/common';
import { TenderService } from '../services/tender.service';
import { CreateTenderSessionDto, CloseTenderSessionDto } from '../dto/create-tender-session.dto';
import { SubmitTenderProposalDto } from '../dto/submit-tender-proposal.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ConditionTenderSessionDto } from '../dto/condition-tender-session.dto';
import { ApiGet, ApiCondition } from '@/common/decorators/swagger';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { Public } from '@/common/decorators/public.decorator';
import { TenderSession, TenderSessionDetails } from '../entities/tender-session.entity';
import { TenderSubmission } from '../entities/tender-submission.entity';
import { PageableDto } from '@/common/dto/pageable.dto';
import { Throttle } from '@nestjs/throttler';
import { UserModel } from '@/modules/user/models/user.model';
import { TenderCriteriaModel } from '../models/tender-criteria.model';
import { TenderSubmissionModel } from '../models/tender-submission.model';
import { UpdateTenderSessionDto } from '../dto/update-tender-session.dto';
import { TenderSessionStatusDto } from '../dto/tender-session-status.dto';

@ApiTags('Tender')
@Controller('tender-sessions')
export class TenderController {
  constructor(private readonly tenderService: TenderService) {}

  @ApiGet({
    mode: 'page',
    summary: 'Lay danh sach phien dau thau cua toi',
    responseType: TenderSession,
    path: 'me',
  })
  @ApiCondition({
    fields: [
      {
        name: '_id',
        type: 'string',
        description: 'Mã phiên đấu thầu',
      },
      {
        name: 'tieuDe',
        type: 'string',
        description: 'Tiêu đề phiên đấu thầu',
      },
      {
        name: 'trangThai',
        type: 'string',
        description: 'Trạng thái phiên',
        enum: Object.values(TrangThaiPhien),
      },
    ],
  })
  @Auth()
  async getPageMe(
    @ReqUser() user: AuthUser,
    @RequestCondition(ConditionTenderSessionDto) condition: ConditionTenderSessionDto,
    @RequestQuery() query: QueryOption,
  ): Promise<PageableDto<TenderSession>> {
    return this.tenderService.getPageMe(user.id, condition, query);
  }

  @ApiGet({
    mode: 'page',
    summary: 'Lay danh sach cac ho so de xuat cua toi',
    responseType: TenderSubmission,
    path: 'me/submissions',
  })
  @Auth()
  async getMySubmissions(
    @ReqUser() user: AuthUser,
    @RequestQuery() query: QueryOption,
  ): Promise<PageableDto<TenderSubmission>> {
    return this.tenderService.getMySubmissions(user.id, query);
  }

  @Get('me/:id')
  @Auth()
  @ApiOperation({ summary: 'Lay chi tiet phien dau thau cua toi' })
  @ApiOkResponse({ type: TenderSessionDetails })
  async getOneMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<TenderSessionDetails> {
    return this.tenderService.getOneMe(user.id, id);
  }

  @Put('me/:id')
  @Auth()
  @ApiOperation({ summary: 'Cap nhat phien dau thau cua toi (chi phien nhap)' })
  @ApiOkResponse({ type: TenderSessionDetails })
  async updateMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTenderSessionDto,
  ): Promise<TenderSessionDetails> {
    return this.tenderService.updateMe(user.id, id, dto);
  }

  @Delete('me/:id')
  @Auth()
  @ApiOperation({ summary: 'Xoa phien dau thau cua toi (chi phien nhap)' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  async deleteMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.tenderService.deleteMe(user.id, id);
  }

  @ApiGet({
    mode: 'page',
    summary: 'Lay danh sach phien dau thau',
    responseType: TenderSession,
  })
  @ApiCondition({
    fields: [
      {
        name: '_id',
        type: 'string',
        description: 'Mã phiên đấu thầu',
      },
      {
        name: 'tieuDe',
        type: 'string',
        description: 'Tiêu đề phiên đấu thầu',
      },
      {
        name: 'chuPhienId',
        type: 'string',
        description: 'Mã chủ phiên',
      },
      {
        name: 'trangThai',
        type: 'string',
        description: 'Trạng thái phiên',
        enum: Object.values(TrangThaiPhien),
      },
      {
        name: 'thoiGianBatDau',
        type: 'date',
        description: 'Thời gian bắt đầu',
      },
      {
        name: 'thoiGianKetThuc',
        type: 'date',
        description: 'Thời gian kết thúc',
      },
    ],
  })
  @Public()
  async getSessions(
    @RequestCondition(ConditionTenderSessionDto)
    condition: ConditionTenderSessionDto,
    @RequestQuery() query: QueryOption,
  ): Promise<PageableDto<TenderSession>> {
    return this.tenderService.getPage({
      where: { ...condition },
      include: [
        { model: UserModel, as: 'chuPhien' },
        { model: TenderCriteriaModel, as: 'tieuChi' },
        { model: TenderSubmissionModel, as: 'deXuatThang' },
      ],
    }, query);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Tao phien dau thau moi' })
  @ApiCreatedResponse({ type: TenderSessionDetails })
  async createSession(
    @ReqUser() user: AuthUser,
    @Body() dto: CreateTenderSessionDto,
  ): Promise<TenderSessionDetails> {
    return this.tenderService.createSession(user.id, dto);
  }

  @Post(':id/publish')
  @Auth()
  @ApiOperation({ summary: 'Cong bo phien dau thau' })
  @ApiOkResponse({ type: TenderSessionDetails })
  async publishSession(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<TenderSessionDetails> {
    return this.tenderService.publishSession(user.id, id);
  }

  @Post(':id/submissions')
  @Auth()
  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @ApiOperation({ summary: 'Nop ho so de xuat' })
  @ApiCreatedResponse({ type: TenderSubmission })
  async submitProposal(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SubmitTenderProposalDto,
  ): Promise<TenderSubmission> {
    dto.phienId = id;
    return this.tenderService.submitProposal(user.id, dto);
  }

  @Post(':id/evaluate')
  @Auth()
  @ApiOperation({ summary: 'Danh gia va xep hang ho so phien dau thau' })
  @ApiOkResponse({ type: TenderSessionDetails })
  async evaluateSession(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<TenderSessionDetails | { message: string }> {
    return this.tenderService.evaluateSession(user.id, id, undefined, false, false, user.role);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lay chi tiết phien dau thau' })
  @ApiOkResponse({ type: TenderSessionDetails })
  async getSessionDetails(@Param('id') id: string): Promise<TenderSessionDetails> {
    return this.tenderService.getSessionDetails(id);
  }

  @Public()
  @Get(':id/status')
  @ApiOperation({ summary: 'Lay trang thai phien dau thau' })
  @ApiOkResponse({ type: TenderSessionStatusDto })
  async getSessionStatus(@Param('id') id: string): Promise<TenderSessionStatusDto> {
    return this.tenderService.getSessionStatus(id);
  }

  @Get(':id/ranking')
  @Auth()
  @ApiOperation({ summary: 'Lay bang xep hang phien dau thau' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        phienId: { type: 'string' },
        trangThai: { type: 'string' },
        danhSach: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              thuHang: { type: 'number' },
              deXuatId: { type: 'string' },
              nguoiThamGiaId: { type: 'string' },
              nguoiThamGia: { type: 'object' },
              bietDanh: { type: 'string' },
              diemKyThuat: { type: 'number' },
              diemGia: { type: 'number' },
              diemTongHop: { type: 'number' },
              trangThai: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getRanking(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<any> {
    return this.tenderService.getRanking(user.id, id, user.role);
  }

  @Post(':id/close')
  @Auth()
  @ApiOperation({ summary: 'Dong phien dau thau' })
  @ApiOkResponse({ type: TenderSessionDetails })
  async closeSession(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CloseTenderSessionDto,
  ): Promise<TenderSessionDetails> {
    return this.tenderService.closeSession(user.id, id, dto.winnerSubmissionId, false, user.role);
  }

  @Get(':id/submissions')
  @Auth()
  @ApiOperation({ summary: 'Lay danh sach de xuat cua phien' })
  @ApiOkResponse({ type: [TenderSubmission] })
  async getSessionSubmissions(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<any[]> {
    return this.tenderService.getSessionSubmissions(user.id, id, user.role);
  }
}
