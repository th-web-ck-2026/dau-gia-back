import { ApiError } from '@/common/exceptions/api-error';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  API_URL: string;
  API_KEY: string;
  constructor(private readonly configService: ConfigService) {
    this.API_URL = 'https://freeimage.host/api/1/upload';
    this.API_KEY = configService.get<string>('file.apiKey');
  }
  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw ApiError.BadRequest('Không có tệp nào được cung cấp.');
    }
    const formData = new FormData();
    formData.append('key', this.API_KEY);
    formData.append(
      'source',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      file.originalname,
    );

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data?.error?.message || 'Không thể tải tệp lên.';
        throw ApiError.BadRequest(
          `Lỗi HTTP: ${response.status} - ${errorMessage}`,
        );
      }

      if (data?.image?.url) {
        return data.image.url;
      } else {
        throw ApiError.BadRequest('Định dạng phản hồi không hợp lệ từ API.');
      }
    } catch (error) {
      console.error('Lỗi khi tải tệp:', error);
      throw error;
    }
  }
  async uploadPrivateFile(file: Express.Multer.File): Promise<string> {
    return "";
  }
}
