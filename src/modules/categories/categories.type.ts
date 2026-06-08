import { JobCategory, Prisma } from '@/prisma/client';

type CategoriesRelations = {
  group: true;
};

export type CategoryType<
  T extends (keyof CategoriesRelations)[] | undefined = undefined,
> = T extends (keyof CategoriesRelations)[]
  ? Prisma.JobCategoryGetPayload<{
      include: Pick<CategoriesRelations, T[number]>;
    }>
  : JobCategory;
