import { Prisma, Resume } from '@/prisma/client';
import { CategoryType } from '@/modules/categories/categories.type';

type ResumeRelations = {
  category: true;
};

export type ResumeType<
  T extends (keyof ResumeRelations)[] | undefined = undefined,
> = T extends (keyof ResumeRelations)[]
  ? Prisma.ResumeGetPayload<{ include: Pick<ResumeRelations, T[number]> }>
  : Resume;

export type ResumeItem = ResumeType & {
  category: CategoryType<['group']> | null;
};
