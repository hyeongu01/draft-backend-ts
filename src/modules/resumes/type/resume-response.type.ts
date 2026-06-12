import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import { type JsonValue } from '@prisma/client/runtime/client';
import type { ResumeItem } from '@/modules/resumes/resumes.type';
import { CategoryResponseType } from '@/modules/categories/type/categories-response.type';
import { PublicUserResponseType } from '@/modules/users/type/public-user-response.type';

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

  @ApiPropertyOptional()
  user?: PublicUserResponseType;

  @ApiPropertyOptional()
  category?: CategoryResponseType;

  @ApiProperty()
  createdAt: DateFormatObject;
  @ApiProperty()
  updatedAt: DateFormatObject;

  static fromResume(item: ResumeItem): ResumeResponseType {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      content: item.content,
      likeCount: item.likeCount,
      scrapCount: item.scrapCount,
      careerYears: item.careerYears ?? undefined,
      isPublic: item.isPublic,
      ...(item.user && {
        user: {
          nickname: item.user.nickname ?? 'unknown',
          profileImageUrl: item.user.profileImageUrl,
        },
      }),
      category: item.category
        ? CategoryResponseType.fromCategory(item.category)
        : undefined,
      createdAt: dateToDateFormatObject(item.createdAt),
      updatedAt: dateToDateFormatObject(item.updatedAt),
    };
  }
}
