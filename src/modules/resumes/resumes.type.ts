import { Prisma, Resume } from '@/prisma/client';

type ResumeRelations = {
  category: true;
};

export type ResumeType<
  T extends (keyof ResumeRelations)[] | undefined = undefined,
> = T extends (keyof ResumeRelations)[]
  ? Prisma.ResumeGetPayload<{ include: Pick<ResumeRelations, T[number]> }>
  : Resume;
