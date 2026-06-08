import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  PaginationMetadataType,
  ResponsePaginatedSuccess,
} from '@/common/types/response.type';

export const ApiResponsePaginatedSuccess = <TModel extends Type>(
  model: TModel,
  options?: { status?: number },
) =>
  applyDecorators(
    ApiExtraModels(ResponsePaginatedSuccess, PaginationMetadataType, model),
    ApiResponse({
      status: options?.status ?? 200,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponsePaginatedSuccess) },
          {
            properties: {
              data: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                  metadata: { $ref: getSchemaPath(PaginationMetadataType) },
                },
                required: ['items', 'metadata'],
              },
            },
            required: ['data'],
          },
        ],
      },
    }),
  );