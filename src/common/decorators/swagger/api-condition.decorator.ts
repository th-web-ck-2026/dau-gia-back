import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

interface ConditionField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
  description?: string;
  example?: any;
  enum?: any[];
}

interface ApiConditionOptions {
  fields: ConditionField[];
  description?: string;
}

/**
 * Decorator thêm query param 'condition' dạng JSON object
 *
 * @param options - Cấu hình các field có thể filter
 * @param options.fields - Danh sách các field có thể dùng để filter
 * @param options.description - Mô tả cho query param condition
 *
 * @example
 * @ApiCondition({
 *   fields: [
 *     { name: 'status', type: 'string', enum: ['active', 'inactive'] },
 *     { name: 'email', type: 'string', description: 'Email người dùng' },
 *     { name: 'verified', type: 'boolean' },
 *   ]
 * })
 * async getUsers(@Query('condition') condition: any) {}
 *
 * // Request: GET /users?condition={"status":"active","verified":true}
 */
export function ApiCondition(options: ApiConditionOptions) {
  const { fields, description } = options;

  // Build example object từ fields
  const exampleObj: any = {};
  const properties: any = {};

  fields.forEach((field) => {
    // Build properties cho schema
    const propSchema: any = {
      description: field.description || field.name,
    };

    switch (field.type) {
      case 'string':
        propSchema.type = 'string';
        propSchema.example = field.example || 'example';
        exampleObj[field.name] = field.example || 'example';
        break;
      case 'number':
        propSchema.type = 'number';
        propSchema.example = field.example || 1;
        exampleObj[field.name] = field.example || 1;
        break;
      case 'boolean':
        propSchema.type = 'boolean';
        propSchema.example = field.example !== undefined ? field.example : true;
        exampleObj[field.name] = field.example !== undefined ? field.example : true;
        break;
      case 'date':
        propSchema.type = 'string';
        propSchema.format = 'date';
        propSchema.example = field.example || '2024-01-01';
        exampleObj[field.name] = field.example || '2024-01-01';
        break;
      case 'array':
        propSchema.type = 'array';
        propSchema.items = { type: 'string' };
        propSchema.example = field.example || ['value1', 'value2'];
        exampleObj[field.name] = field.example || ['value1', 'value2'];
        break;
    }

    // Thêm enum nếu có
    if (field.enum && field.enum.length > 0) {
      propSchema.enum = field.enum;
      propSchema.example = field.example || field.enum[0];
      exampleObj[field.name] = field.example || field.enum[0];
    }

    properties[field.name] = propSchema;
  });

  const decorator = ApiQuery({
    name: 'condition',
    required: false,
    description: description || 'Filter conditions (JSON object)',
    schema: {
      type: 'object',
      properties,
      example: exampleObj,
    },
    example: JSON.stringify(exampleObj),
  });

  return applyDecorators(decorator);
}
