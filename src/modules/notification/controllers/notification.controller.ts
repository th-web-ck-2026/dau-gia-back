import { Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { ReqUser } from '@/common/decorators/user.decorator';
import { RequestQuery } from '@/common/decorators/request-query.decorator';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { ApiOperation } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @ApiOperation({ summary: 'Lấy thông báo của tôi' })
  @Get('me/page')
  async getMyNotifications(
    @ReqUser() user,
    @RequestQuery() query: QueryOption,
  ) {
    return this.notificationService.getMyNotifications(user.id, query);
  }
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  @Post('read/all')
  async markAllAsRead(@ReqUser() user) {
    return this.notificationService.markAllAsRead(user.id);
  }
  @ApiOperation({ summary: 'Đánh dấu đã đọc thông báo' })
  @Post('read/:notificationId')
  async markAsRead(
    @ReqUser() user,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.markAsRead(user.id, notificationId);
  }
}
