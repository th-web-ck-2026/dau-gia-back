import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGet, ApiCondition } from '../../../common/decorators/swagger';
import { RequestQuery } from '../../../common/decorators/request-query.decorator';
import { QueryOption } from '../../../common/pipe/query-option.interface';

/**
 * File ví dụ sử dụng các Swagger decorators
 * Không dùng trong production - chỉ để tham khảo
 */

@ApiTags('Examples')
@Controller('examples')
export class ExampleController {
  /**
   * Ví dụ 1: API với pagination
   * Tự động có page, limit, order trong Swagger
   */
  @ApiGet({
    mode: 'page',
    summary: 'Lấy danh sách users có phân trang',
    description: 'API này trả về danh sách users với pagination',
  })
  async getUsersWithPagination(@RequestQuery() query: QueryOption) {
    // Logic xử lý
    return {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 100,
      offset: 0,
      result: [],
    };
  }

  /**
   * Ví dụ 2: API trả về array đơn giản (không pagination)
   */
  @ApiGet({
    mode: 'many',
    summary: 'Lấy tất cả roles',
    description: 'API này trả về tất cả roles không phân trang',
  })
  async getAllRoles() {
    // Logic xử lý
    return ['admin', 'user', 'guest'];
  }

  /**
   * Ví dụ 3: API với conditions (filter)
   */
  @ApiGet({
    mode: 'page',
    summary: 'Tìm kiếm users với điều kiện',
  })
  @ApiCondition({
    fields: [
      {
        name: 'status',
        type: 'string',
        description: 'Trạng thái tài khoản',
        enum: ['active', 'inactive', 'banned'],
        example: 'active',
      },
      {
        name: 'email',
        type: 'string',
        description: 'Email người dùng (tìm kiếm gần đúng)',
        example: 'user@example.com',
      },
      {
        name: 'role',
        type: 'string',
        description: 'Vai trò',
        enum: ['admin', 'user', 'guest'],
      },
      {
        name: 'verified',
        type: 'boolean',
        description: 'Đã xác thực email',
        example: true,
      },
      {
        name: 'createdFrom',
        type: 'date',
        description: 'Tạo từ ngày',
        example: '2024-01-01',
      },
      {
        name: 'createdTo',
        type: 'date',
        description: 'Tạo đến ngày',
        example: '2024-12-31',
      },
    ],
  })
  async searchUsers(
    @RequestQuery() query: QueryOption,
    // Các query params từ @ApiCondition sẽ tự động xuất hiện trong Swagger
  ) {
    // Logic xử lý filter
    return {
      page: 1,
      limit: 10,
      total: 50,
      offset: 0,
      result: [],
    };
  }

  /**
   * Ví dụ 4: API với path parameter
   */
  @ApiGet({
    mode: 'many',
    summary: 'Lấy danh sách posts của user',
    path: ':userId/posts',
  })
  async getUserPosts() {
    return [];
  }

  /**
   * Ví dụ 5: Kết hợp nhiều decorator
   */
  @ApiGet({
    mode: 'page',
    summary: 'Tìm kiếm sản phẩm',
  })
  @ApiCondition({
    fields: [
      {
        name: 'category',
        type: 'string',
        description: 'Danh mục sản phẩm',
      },
      {
        name: 'minPrice',
        type: 'number',
        description: 'Giá tối thiểu',
        example: 0,
      },
      {
        name: 'maxPrice',
        type: 'number',
        description: 'Giá tối đa',
        example: 1000000,
      },
      {
        name: 'inStock',
        type: 'boolean',
        description: 'Còn hàng',
      },
    ],
  })
  async searchProducts(@RequestQuery() query: QueryOption) {
    return {
      page: 1,
      limit: 10,
      total: 0,
      offset: 0,
      result: [],
    };
  }
}
