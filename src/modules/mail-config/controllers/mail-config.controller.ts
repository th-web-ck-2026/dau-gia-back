import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MailConfigService } from '../services/mail-config.service';
import { CreateMailConfigDto } from '../dto/create-mail-config.dto';
import { UpdateMailConfigDto } from '../dto/update-mail-config.dto';
import { Auth } from '@Decorators/auth.decorator';
import { UserRoles } from '@/modules/user/common/constant';

@Auth(UserRoles.ADMIN)
@Controller('mail-config')
export class MailConfigController {
  constructor(private readonly mailConfigService: MailConfigService) {}

  @Post()
  create(@Body() createMailConfigDto: CreateMailConfigDto) {
    return this.mailConfigService.create(createMailConfigDto);
  }

  @Get()
  findAll() {
    return this.mailConfigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mailConfigService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMailConfigDto: UpdateMailConfigDto,
  ) {
    return this.mailConfigService.update(id, updateMailConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mailConfigService.remove(id);
  }
}
