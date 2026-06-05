import { Controller, Put, Body } from '@nestjs/common';
import { ToChucProfileService } from '../services/to-chuc-profile.service';
import { UpdateToChucProfileDto } from '../dto/update-to-chuc-profile.dto';
import { Auth } from '@Decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
@Auth()
@Controller('to-chuc-profile')
export class ToChucProfileController {
  constructor(private readonly toChucProfileService: ToChucProfileService) {}

  @Put('me')
  async updateMe(@ReqUser() user, @Body() dto: UpdateToChucProfileDto) {
    return this.toChucProfileService.updateMe(user, dto);
  }
}
