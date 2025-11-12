import {
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from '../services/file.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Auth } from '@/common/decorators/auth.decorator';
import { ReqUser } from '@/common/decorators/user.decorator';
import { AuthUser } from '@/common/interfaces/auth-user.interface';

@Auth()
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({ summary: 'Upload ảnh' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Tải lên một file ảnh',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('image/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.uploadFile(file);
  }

  @ApiOperation({ summary: 'Upload ảnh riêng tư' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Tải lên một file ảnh riêng tư',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('image/upload/private')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPrivateFile(
    @ReqUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.uploadPrivateFile(user, file);
  }
}
