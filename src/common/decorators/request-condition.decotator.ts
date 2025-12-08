import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Op } from 'sequelize';

type Primitive = string | number | boolean | null | Date;
type Between = [Primitive, Primitive];
type OperatorValue = Primitive | Primitive[] | Between;

export interface FieldOperatorObject {
  $eq?: Primitive;
  $ne?: Primitive;
  $in?: Primitive[];
  $notIn?: Primitive[];
  $like?: Primitive;
  $ilike?: Primitive;
  $gt?: Primitive;
  $gte?: Primitive;
  $lt?: Primitive;
  $lte?: Primitive;
  $between?: Between;
  $notBetween?: Between;
  $is?: Primitive | null;
  $not?: Primitive | Primitive[];
}

type ConditionInput = Record<string, unknown>;

export interface ConditionStructure {
  [key: string]: unknown | FieldOperatorObject | Primitive[];
  $or?: ConditionInput[];
  $and?: ConditionInput[];
}

export function RequestCondition(DtoClass: any): ParameterDecorator {
  return createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const raw = request.query.condition;

    if (!raw) return {};

    let parsed: ConditionInput;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new BadRequestException('Invalid JSON in "condition" query param.');
    }

    const { $or: rawOr, $and: rawAnd, ...baseCondition } = parsed as ConditionInput &
      ConditionStructure;

    const operatorMap: Record<string, symbol> = {
      $eq: Op.eq,
      $ne: Op.ne,
      $in: Op.in,
      $notIn: Op.notIn,
      $like: Op.like,
      $ilike: Op.iLike,
      $gt: Op.gt,
      $gte: Op.gte,
      $lt: Op.lt,
      $lte: Op.lte,
      $between: Op.between,
      $notBetween: Op.notBetween,
      $is: Op.is,
      $not: Op.not,
    };

    const allowedOperatorKeys = new Set(Object.keys(operatorMap));

    const isPlainObject = (
      val: unknown,
    ): val is Record<string, unknown> =>
      val !== null && typeof val === 'object' && !Array.isArray(val);

    const validateValue = (field: string, value: unknown) => {
      const dto = plainToInstance(DtoClass, { [field]: value }) as object;
      const errors = validateSync(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      });

      if (errors.length > 0) {
        const errorMessages = errors
          .map((err) => Object.values(err.constraints || {}).join(', '))
          .join('; ');
        throw new BadRequestException(
          `Invalid value "${value}" for field "${field}". ${errorMessages}`,
        );
      }
    };

    const buildWhere = (input: ConditionInput) => {
      const where: Record<string, any> = {};

      for (const key in input) {
        const value = input[key];

        if (key.startsWith('$')) {
          throw new BadRequestException(
            `Unsupported operator at field level: "${key}". Use $or or $and at top level.`,
          );
        }

        if (Array.isArray(value)) {
          value.forEach((element) => validateValue(key, element));
          where[key] = { [Op.in]: value };
          continue;
        }

        if (isPlainObject(value)) {
          const operatorClauses: Record<symbol, OperatorValue> = {};

          for (const opKey in value) {
            if (!allowedOperatorKeys.has(opKey)) {
              throw new BadRequestException(
                `Operator "${opKey}" is not supported. Supported operators: ${Array.from(allowedOperatorKeys).join(', ')}`,
              );
            }

            const opVal = (value as FieldOperatorObject)[
              opKey as keyof FieldOperatorObject
            ];
            const mappedOp = operatorMap[opKey];

            if (
              (opKey === '$between' || opKey === '$notBetween') &&
              !Array.isArray(opVal)
            ) {
              throw new BadRequestException(
                `"${opKey}" must be an array of two values.`,
              );
            }
            if (
              (opKey === '$between' || opKey === '$notBetween') &&
              Array.isArray(opVal)
            ) {
              if (opVal.length !== 2) {
                throw new BadRequestException(
                  `"${opKey}" must contain exactly two values.`,
                );
              }
              (opVal as Primitive[]).forEach((element) =>
                validateValue(key, element),
              );
            } else if (Array.isArray(opVal)) {
              (opVal as Primitive[]).forEach((element) =>
                validateValue(key, element),
              );
            } else {
              validateValue(key, opVal as Primitive);
            }

            operatorClauses[mappedOp] = opVal as OperatorValue;
          }

          where[key] = operatorClauses;
          continue;
        }

        validateValue(key, value);
        where[key] = { [Op.eq]: value };
      }

      return where;
    };

    const baseWhere = buildWhere(baseCondition);

    let result: Record<string | symbol, any> = { ...baseWhere };

    if (rawAnd !== undefined) {
      if (!Array.isArray(rawAnd)) {
        throw new BadRequestException('"$and" must be an array of condition objects.');
      }

      const andWhere = rawAnd.map((cond) => {
        if (cond === null || typeof cond !== 'object' || Array.isArray(cond)) {
          throw new BadRequestException(
            '"$and" must contain objects with condition fields.',
          );
        }
        return buildWhere(cond as ConditionInput);
      });

      result = { ...result, [Op.and]: andWhere };
    }

    if (rawOr !== undefined) {
      if (!Array.isArray(rawOr)) {
        throw new BadRequestException('"$or" must be an array of condition objects.');
      }

      const orWhere = rawOr.map((cond) => {
        if (cond === null || typeof cond !== 'object' || Array.isArray(cond)) {
          throw new BadRequestException(
            '"$or" must contain objects with condition fields.',
          );
        }
        return buildWhere(cond as ConditionInput);
      });

      result = { ...result, [Op.or]: orWhere };
    }

    return result;
  })();
}
