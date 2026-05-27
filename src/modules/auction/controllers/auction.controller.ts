import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { AuctionService } from '../services/auction.service';
import { CreateAuctionSessionDto } from '../dto/create-auction-session.dto';
import { PlaceAuctionBidDto } from '../dto/place-auction-bid.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequestCondition } from '@/common/decorators/request-condition.decotator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ConditionAuctionSessionDto } from '../dto/condition-auction-session.dto';

@ApiTags('Auction')
@Controller('auction-sessions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  @ApiOperation({ summary: 'Lay danh sach phien dau gia' })
  async getSessions(
    @RequestCondition(ConditionAuctionSessionDto) condition: any,
    @RequestQuery() query: QueryOption,
  ) {
    return this.auctionService.getPage({ where: condition }, query);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Tao phien dau gia moi' })
  async createSession(@ReqUser() user: AuthUser, @Body() dto: CreateAuctionSessionDto) {
    return this.auctionService.createSession(user.id, dto);
  }

  @Post(':id/publish')
  @Auth()
  @ApiOperation({ summary: 'Cong bo phien dau gia' })
  async publishSession(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.auctionService.publishSession(user.id, id);
  }

  @Post(':id/bids')
  @Auth()
  @ApiOperation({ summary: 'Dat gia dau gia' })
  async placeBid(
    @ReqUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: PlaceAuctionBidDto,
  ) {
    dto.phienId = id;
    return this.auctionService.placeBid(user.id, dto);
  }

  @Post(':id/evaluate')
  @Auth()
  @ApiOperation({ summary: 'Danh gia va xep hang phien dau gia' })
  async evaluateSession(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.auctionService.evaluateSession(user.id, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lay chi tiet phien dau gia' })
  async getSessionDetails(@Param('id') id: string) {
    return this.auctionService.getSessionDetails(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Lay trang thai phien dau gia' })
  async getSessionStatus(@Param('id') id: string) {
    return this.auctionService.getSessionStatus(id);
  }

  @Post(':id/close')
  @Auth()
  @ApiOperation({ summary: 'Dong phien dau gia' })
  async closeSession(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.auctionService.closeSession(user.id, id);
  }

  @Get(':id/bids')
  @Auth()
  @ApiOperation({ summary: 'Lay danh sach cac luot dat gia cua phien' })
  async getSessionBids(@ReqUser() user: AuthUser, @Param('id') id: string) {
    return this.auctionService.getSessionBids(user.id, id);
  }
}
