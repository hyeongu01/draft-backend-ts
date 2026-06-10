import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import { type JsonValue } from '@prisma/client/runtime/client';
import { ResumeType } from '@/modules/resumes/resumes.type';
import { CategoryType } from '@/modules/categories/categories.type';

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
  category?: ResumeCategoryResponseType;

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
        ? ResumeCategoryResponseType.fromCategory(item.category)
        : undefined,
      createdAt: dateToDateFormatObject(item.createdAt),
      updatedAt: dateToDateFormatObject(item.updatedAt),
    };
  }
}

class ResumeCategoryResponseType {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: DateFormatObject;

  @ApiProperty()
  updatedAt: DateFormatObject;

  static fromCategory(item: CategoryType): ResumeCategoryResponseType {
    return {
      id: item.id,
      name: item.name,
      createdAt: dateToDateFormatObject(item.createdAt),
      updatedAt: dateToDateFormatObject(item.updatedAt),
    };
  }
}
