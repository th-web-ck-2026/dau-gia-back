import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Op } from 'sequelize';

export function RequestCondition(DtoClass: any): ParameterDecorator {
  return createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const raw = request.query.condition;

      if (!raw) return {};

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        throw new BadRequestException('Invalid JSON in "condition" query param.');
      }

      // Separate array and non-array fields
      const arrayFields: Record<string, any[]> = {};
      const nonArrayFields: Record<string, any> = {};

      for (const key in parsed) {
        if (Array.isArray(parsed[key])) {
          arrayFields[key] = parsed[key];
        } else {
          nonArrayFields[key] = parsed[key];
        }
      }

      if (Object.keys(nonArrayFields).length > 0) {
        const dto = plainToInstance(DtoClass, nonArrayFields) as object;
        const errors = validateSync(dto, { 
          whitelist: true, 
          forbidNonWhitelisted: true,
          skipMissingProperties: true,
        });

        if (errors.length > 0) {
          throw new BadRequestException('Condition object contains invalid fields.');
        }
      }

      for (const key in arrayFields) {
        const arrayValue = arrayFields[key];  
        for (const element of arrayValue) {
          const tempDto = plainToInstance(DtoClass, { [key]: element }) as object;
          const errors = validateSync(tempDto, {
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: true,
          });

          if (errors.length > 0) {
            const errorMessages = errors
              .map(err => Object.values(err.constraints || {}).join(', '))
              .join('; ');
            throw new BadRequestException(
              `Invalid value "${element}" in array for field "${key}". ${errorMessages}`
            );
          }
        }
      }

      const where: Record<string, any> = {};

      for (const key in nonArrayFields) {
        where[key] = { [Op.eq]: nonArrayFields[key] };
      }

      for (const key in arrayFields) {
        where[key] = { [Op.in]: arrayFields[key] };
      }

      return where;
    },
  )();
}
