import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from '../services/file.service';
import { Public } from '@/common/decorators/public.decorator';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Public()
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

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
}
