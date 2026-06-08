import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { JobCategory, Resume } from '@/prisma/client';
import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import { type JsonValue } from '@prisma/client/runtime/client';
import { ResumeType } from '@/modules/resumes/resumes.type';

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

  // TODO: category 응답 형식 지정
  @ApiPropertyOptional()
  category?: JobCategory;

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
      category: item.category ?? undefined,
      createdAt: dateToDateFormatObject(item.createdAt),
      updatedAt: dateToDateFormatObject(item.updatedAt),
    };
  }
}
