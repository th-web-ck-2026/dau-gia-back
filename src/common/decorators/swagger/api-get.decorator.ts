import { applyDecorators, Get } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

type ApiGetMode = 'page' | 'many';

interface ApiGetOptions {
  mode: ApiGetMode;
  summary: string;
  path?: string;
  responseType?: any;
  description?: string;
}

/**
 * Decorator kết hợp @Get với Swagger documentation
 *
 * @param options - Cấu hình cho API endpoint
 * @param options.mode - 'page': có pagination (page, limit), 'many': trả về array đơn giản
 * @param options.summary - Mô tả ngắn gọn cho API
 * @param options.path - Route path (optional)
 * @param options.responseType - Type của response data (optional)
 * @param options.description - Mô tả chi tiết (optional)
 *
 * @example
 * // API với pagination
 * @ApiGet({ mode: 'page', summary: 'Lấy danh sách users' })
 * async getUsers(@RequestQuery() query: QueryOption) {}
 *
 * @example
 * // API trả về array đơn giản
 * @ApiGet({ mode: 'many', summary: 'Lấy tất cả roles' })
 * async getRoles() {}
 */
export function ApiGet(options: ApiGetOptions) {
  const { mode, summary, path, responseType, description } = options;

  const decorators = [
    Get(path),
    ApiOperation({
      summary,
      description: description || summary,
    }),
  ];

  // Thêm query params cho mode 'page'
  if (mode === 'page') {
    decorators.push(
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Số trang (mặc định: 1)',
        example: 1,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Số lượng items mỗi trang (mặc định: 10)',
        example: 10,
      }),
      ApiQuery({
        name: 'order',
        required: false,
        type: String,
        description: 'Sắp xếp theo field (format: field:ASC hoặc field:DESC)',
        example: 'createdAt:DESC',
      }),
    );

    // Response cho pagination
    decorators.push(
      ApiResponse({
        status: 200,
        description: 'Thành công',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'number', example: 200 },
            path: { type: 'string', example: '/api/users' },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            data: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 100 },
                offset: { type: 'number', example: 0 },
                result: {
                  type: 'array',
                  items: responseType ? { $ref: `#/components/schemas/${responseType.name}` } : { type: 'object' },
                },
              },
            },
          },
        },
      }),
    );
  } else if (mode === 'many') {
    // Response cho array đơn giản
    decorators.push(
      ApiResponse({
        status: 200,
        description: 'Thành công',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'number', example: 200 },
            path: { type: 'string', example: '/api/roles' },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            data: {
              type: 'array',
              items: responseType ? { $ref: `#/components/schemas/${responseType.name}` } : { type: 'object' },
            },
          },
        },
      }),
    );
  }

  return applyDecorators(...decorators);
}
