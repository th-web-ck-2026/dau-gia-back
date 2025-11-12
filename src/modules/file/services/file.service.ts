import { ApiError } from '@/common/exceptions/api-error';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  API_URL: string;
  API_KEY: string;
  API_PRIVATE_URL: string;
  API_PRIVATE_KEY: string;
  constructor(private readonly configService: ConfigService) {
    this.API_URL = 'https://freeimage.host/api/1/upload';
    this.API_KEY = configService.get<string>('file.apiKey');

    this.API_PRIVATE_URL = 'https://upload.gofile.io/uploadfile';
    this.API_PRIVATE_KEY = configService.get<string>('file.apiPrivateKey');
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
  async uploadPrivateFile(
    user: AuthUser,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw ApiError.BadRequest('Không có tệp nào được cung cấp.');
    }

    const newFileName = `${user.id}_${user.fullname}_${Date.now()}`;

    const formData = new FormData();
    formData.append(
      'file',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      newFileName,
    );
    try {
      const response = await fetch(this.API_PRIVATE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.API_PRIVATE_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'ok') {
        const errorMessage =
          data?.error || 'Không thể tải tệp lên dịch vụ riêng tư.';
        throw ApiError.BadRequest(
          `Lỗi HTTP: ${response.status} - ${errorMessage}`,
        );
      }

      if (data?.data?.downloadPage) {
        return data.data.downloadPage;
      } else {
        throw ApiError.BadRequest(
          'Định dạng phản hồi không hợp lệ từ API riêng tư.',
        );
      }
    } catch (error) {
      console.error('Lỗi khi tải tệp riêng tư:', error);
      throw error;
    }
  }
}
