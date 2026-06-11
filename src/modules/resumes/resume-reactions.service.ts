import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import type { ResumeLike, User } from '@/prisma/client';
import { type ToggleLikeResponseType } from '@/modules/resumes/type/toggle-like-response.type';
import { ToggleScrapResponseType } from '@/modules/resumes/type/toggle-scrap-response.type';

@Injectable()
export class ResumeReactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async toggleLike(
    user: User,
    resumeId: string,
  ): Promise<ToggleLikeResponseType> {
    return this.prismaService.$transaction(async (tx) => {
      const like: ResumeLike | null = await tx.resumeLike.findUnique({
        where: {
          userId_resumeId: { userId: user.id, resumeId },
        },
      });
      if (like) {
        await tx.resumeLike.delete({
          where: {
            userId_resumeId: { userId: user.id, resumeId },
          },
        });

        const { likeCount } = await tx.resume.update({
          where: {
            id: resumeId,
          },
          data: { likeCount: { decrement: 1 } },
        });
        return { likeCount, isLiked: false };
      } else {
        await tx.resumeLike.create({
          data: {
            userId: user.id,
            resumeId,
          },
        });

        const { likeCount } = await tx.resume.update({
          where: {
            id: resumeId,
          },
          data: { likeCount: { increment: 1 } },
        });
        return { likeCount, isLiked: true };
      }
    });
  }

  async toggleScrap(
    user: User,
    resumeId: string,
  ): Promise<ToggleScrapResponseType> {
    return this.prismaService.$transaction(async (tx) => {
      const scrap = await tx.resumeScrap.findUnique({
        where: {
          userId_resumeId: { userId: user.id, resumeId },
        },
      });

      if (!scrap) {
        await tx.resumeScrap.create({
          data: { userId: user.id, resumeId },
        });

        const { scrapCount } = await tx.resume.update({
          where: { id: resumeId },
          data: { scrapCount: { increment: 1 } },
        });
        return { scrapCount, isScrapped: true };
      } else {
        await tx.resumeScrap.delete({
          where: { userId_resumeId: { userId: user.id, resumeId } },
        });

        const { scrapCount } = await tx.resume.update({
          where: { id: resumeId },
          data: { scrapCount: { decrement: 1 } },
        });
        return { scrapCount, isScrapped: true };
      }
    });
  }
}
