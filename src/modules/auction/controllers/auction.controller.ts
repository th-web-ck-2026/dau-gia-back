import { Controller, Post, Body, Param, Get, Put, Delete } from '@nestjs/common';
import { AuctionService } from '../services/auction.service';
import { CreateAuctionSessionDto } from '../dto/create-auction-session.dto';
import { PlaceAuctionBidDto } from '../dto/place-auction-bid.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ConditionAuctionSessionDto } from '../dto/condition-auction-session.dto';
import { ApiGet, ApiCondition } from '@/common/decorators/swagger';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { Public } from '@/common/decorators/public.decorator';
import { AuctionSession } from '../entities/auction-session.entity';
import { AuctionBid } from '../entities/auction-bid.entity';
import { AuctionSessionStatusDto } from '../dto/auction-session-status.dto';
import { PageableDto } from '@/common/dto/pageable.dto';
import { Throttle } from '@nestjs/throttler';
import { UserModel } from '@/modules/user/models/user.model';
import { AuctionBidModel } from '../models/auction-bid.model';
import { AuctionRankingResponse, AuctionRankingOrMessage } from '../dto/auction-ranking.dto';
import { UpdateAuctionSessionDto } from '../dto/update-auction-session.dto';

@ApiTags('Auction')
@Controller('auction-sessions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @ApiGet({
    mode: 'page',
    summary: 'Lay danh sach phien dau gia cua toi',
    responseType: AuctionSession,
    path: 'me',
  })
  @ApiCondition({
    fields: [
      {
        name: '_id',
        type: 'string',
        description: 'Mã phiên đấu giá',
      },
      {
        name: 'tieuDe',
        type: 'string',
        description: 'Tiêu đề phiên đấu giá',
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
    @RequestCondition(ConditionAuctionSessionDto) condition: ConditionAuctionSessionDto,
    @RequestQuery() query: QueryOption,
  ): Promise<PageableDto<AuctionSession>> {
    return this.auctionService.getPageMe(user.id, condition, query);
  }

  @ApiGet({
    mode: 'page',
    summary: 'Lay danh sach cac luot dat gia cua toi',
    responseType: AuctionBid,
    path: 'me/bids',
  })
  @Auth()
  async getMyBids(
    @ReqUser() user: AuthUser,
    @RequestQuery() query: QueryOption,
  ): Promise<PageableDto<AuctionBid>> {
    return this.auctionService.getMyBids(user.id, query);
  }

  @Get('me/:id')
  @Auth()
  @ApiOperation({ summary: 'Lay chi tiet phien dau gia cua toi' })
  @ApiOkResponse({ type: AuctionSession })
  async getOneMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<AuctionSession> {
    return this.auctionService.getOneMe(user.id, id);
  }

  @Put('me/:id')
  @Auth()
  @ApiOperation({ summary: 'Cap nhat phien dau gia cua toi (chi phien nhap)' })
  @ApiOkResponse({ type: AuctionSession })
  async updateMe(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAuctionSessionDto,
  ): Promise<AuctionSession> {
    return this.auctionService.updateMe(user.id, id, dto);
  }

  @Delete('me/:id')
  @Auth()
  @ApiOperation({ summary: 'Xoa phien dau gia cua toi (chi phien nhap)' })
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
    return this.auctionService.deleteMe(user.id, id);
  }

  @ApiGet({
    mode: 'page',
    summary: 'Lay danh sach phien dau gia',
    responseType: AuctionSession,
  })
  @ApiCondition({
    fields: [
      {
        name: '_id',
        type: 'string',
        description: 'Mã phiên đấu giá',
      },
      {
        name: 'tieuDe',
        type: 'string',
        description: 'Tiêu đề phiên đấu giá',
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
    @RequestCondition(ConditionAuctionSessionDto) condition: ConditionAuctionSessionDto,
    @RequestQuery() query: QueryOption,
  ): Promise<PageableDto<AuctionSession>> {
    return this.auctionService.getPage({
      where: condition as any,
      include: [
        { model: UserModel, as: 'chuPhien', attributes: ['_id', 'fullname', 'email', 'phone', 'avatar'] },
        { model: AuctionBidModel, as: 'deXuatThang' },
      ],
    }, query);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Tao phien dau gia moi' })
  @ApiCreatedResponse({ type: AuctionSession })
  async createSession(
    @ReqUser() user: AuthUser,
    @Body() dto: CreateAuctionSessionDto,
  ): Promise<AuctionSession> {
    return this.auctionService.createSession(user.id, dto);
  }

  @Post(':id/publish')
  @Auth()
  @ApiOperation({ summary: 'Cong bo phien dau gia' })
  @ApiOkResponse({ type: AuctionSession })
  async publishSession(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<AuctionSession> {
    return this.auctionService.publishSession(user.id, id);
  }

  @Post(':id/bids')
  @Auth()
  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @ApiOperation({ summary: 'Dat gia dau gia' })
  @ApiCreatedResponse({ type: AuctionBid })
  async placeBid(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: PlaceAuctionBidDto,
  ): Promise<AuctionBid> {
    dto.phienId = id;
    return this.auctionService.placeBid(user.id, dto);
  }

  @Post(':id/evaluate')
  @Auth()
  @ApiOperation({ summary: 'Danh gia va xep hang phien dau gia' })
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
              bidId: { type: 'string' },
              nguoiThamGiaId: { type: 'string' },
              bietDanh: { type: 'string' },
              giaDat: { type: 'number' },
              diemGia: { type: 'number' },
              diemTongHop: { type: 'number' },
              trangThai: { type: 'string' },
              thoiDiemDat: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async evaluateSession(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<AuctionRankingOrMessage> {
    return this.auctionService.evaluateSession(user.id, id, false, false, user.role);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lay chi tiet phien dau gia' })
  @ApiOkResponse({ type: AuctionSession })
  async getSessionDetails(@Param('id') id: string): Promise<AuctionSession> {
    return this.auctionService.getSessionDetails(id);
  }

  @Get(':id/ranking')
  @Auth()
  @ApiOperation({ summary: 'Lay bang xep hang phien dau gia' })
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
              bidId: { type: 'string' },
              nguoiThamGiaId: { type: 'string' },
              bietDanh: { type: 'string' },
              giaDat: { type: 'number' },
              diemGia: { type: 'number' },
              diemTongHop: { type: 'number' },
              trangThai: { type: 'string' },
              thoiDiemDat: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getRanking(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<AuctionRankingResponse> {
    return this.auctionService.getRanking(user.id, id, user.role);
  }

  @Public()
  @Get(':id/status')
  @ApiOperation({ summary: 'Lay trang thai phien dau gia' })
  @ApiOkResponse({ type: AuctionSessionStatusDto })
  async getSessionStatus(@Param('id') id: string): Promise<AuctionSessionStatusDto> {
    return this.auctionService.getSessionStatus(id);
  }

  @Post(':id/close')
  @Auth()
  @ApiOperation({ summary: 'Dong phien dau gia' })
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
              bidId: { type: 'string' },
              nguoiThamGiaId: { type: 'string' },
              bietDanh: { type: 'string' },
              giaDat: { type: 'number' },
              diemGia: { type: 'number' },
              diemTongHop: { type: 'number' },
              trangThai: { type: 'string' },
              thoiDiemDat: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async closeSession(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<AuctionRankingOrMessage> {
    return this.auctionService.closeSession(user.id, id, false, user.role);
  }

  @Get(':id/bids')
  @Auth()
  @ApiOperation({ summary: 'Lay danh sach cac luot dat gia cua phien' })
  @ApiOkResponse({ type: [AuctionBid] })
  async getSessionBids(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<AuctionBid[]> {
    return this.auctionService.getSessionBids(user.id, id, user.role);
  }
}
