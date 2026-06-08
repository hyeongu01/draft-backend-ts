import { JobGroup } from '@/prisma/client';
import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import { CategoryType } from '@/modules/categories/categories.type';

export class CategoryResponseType {
  id: number;
  name: string;
  group: JobGroup;
  createdAt: DateFormatObject;
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
