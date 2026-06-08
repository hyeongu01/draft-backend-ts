import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { CreateResumeDto } from '@/modules/resumes/dto/create-resume.dto';
import type { Resume, User } from '@/prisma/client';
import { ResumeType } from '@/modules/resumes/resumes.type';

@Injectable()
export class ResumesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createItem(
    user: User,
    createResumeDto: CreateResumeDto,
  ): Promise<ResumeType<['category']>> {
    return this.prismaService.resume.create({
      data: {
        userId: user.id,
        ...createResumeDto,
      },
      include: {
        category: true,
      },
    });
  }
}
