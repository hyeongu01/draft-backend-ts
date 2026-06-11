import { type JobGroup } from '@/prisma/client';
import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import { CategoryType } from '@/modules/categories/categories.type';
import { ApiProperty } from '@nestjs/swagger';

export class GroupResponseType implements JobGroup {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CategoryResponseType {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  // TODO: group도 표준 응답 형식으로 변경
  @ApiProperty()
  group: GroupResponseType;

  @ApiProperty()
  createdAt: DateFormatObject;

  @ApiProperty()
  updatedAt: DateFormatObject;

  static fromCategory(item: CategoryType<['group']>): CategoryResponseType {
    return {
      id: item.id,
      name: item.name,
      group: item.group,
      createdAt: dateToDateFormatObject(item.createdAt),
      updatedAt: dateToDateFormatObject(item.updatedAt),
    };
  }
}
