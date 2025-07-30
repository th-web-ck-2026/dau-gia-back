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
      
      const dto = plainToInstance(DtoClass, parsed);
      const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });

      if (errors.length > 0) {
        throw new BadRequestException('Condition object contains invalid fields.');
      }

      const where: Record<string, any> = {};

      for (const key in dto) {
        const value = parsed[key];

        if (Array.isArray(value)) {
          where[key] = { [Op.in]: value };
        } else {
          where[key] = { [Op.eq]: value };
        }
      }

      return where;
    },
  )();
}
