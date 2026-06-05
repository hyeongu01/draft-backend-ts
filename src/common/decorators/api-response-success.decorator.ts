import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseSuccess } from '@/common/types/response.type';

export const ApiResponseSuccess = <TModel extends Type>(
  model?: TModel,
  options?: { status?: number },
) => {
  const dataSchema = model
    ? { $ref: getSchemaPath(model) }
    : { type: 'object' as const, additionalProperties: false, example: {} };

  return applyDecorators(
    ApiExtraModels(...(model ? [ResponseSuccess, model] : [ResponseSuccess])),
    ApiResponse({
      status: options?.status ?? 200,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseSuccess) },
          { properties: { data: dataSchema }, required: ['data'] },
        ],
      },
    }),
  );
};
