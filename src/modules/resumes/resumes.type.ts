import { Prisma, type Resume, type User } from '@/prisma/client';
import { CategoryType } from '@/modules/categories/categories.type';
import { PublicUserResponseType } from '@/modules/users/type/public-user-response.type';

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
  user?: Pick<User, 'nickname' | 'profileImageUrl'>;
};
