import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { JobCategory, Resume } from '@/prisma/client';
import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import { type JsonValue } from '@prisma/client/runtime/client';
import { ResumeType } from '@/modules/resumes/resumes.type';
import { CategoryResponseType } from '@/modules/categories/type/categories-response.type';

export class ResumeResponseType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  content: JsonValue;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  scrapCount: number;

  @ApiPropertyOptional()
  careerYears?: number;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ type: 'number', minimum: 1 })
  categoryId?: number;

  // TODO: 어떻게 할지 정하기
  @ApiPropertyOptional()
  category?: {};

  @ApiProperty()
  createdAt: DateFormatObject;
  @ApiProperty()
  updatedAt: DateFormatObject;

  static fromResume(item: ResumeType<['category']>): ResumeResponseType {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      content: item.content,
      likeCount: item.likeCount,
      scrapCount: item.scrapCount,
      careerYears: item.careerYears ?? undefined,
      isPublic: item.isPublic,
      userId: item.userId,
      categoryId: item.categoryId ?? undefined,
      category: item.category
        ? CategoryResponseType.fromCategory(item.category)
        : undefined,
      createdAt: dateToDateFormatObject(item.createdAt),
      updatedAt: dateToDateFormatObject(item.updatedAt),
    };
  }
}
