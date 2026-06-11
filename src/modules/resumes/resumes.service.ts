import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { CreateResumeDto } from '@/modules/resumes/dto/create-resume.dto';
import { Prisma, Resume, User } from '@/prisma/client';
import { ResumeItem } from '@/modules/resumes/resumes.type';
import { UpdateResumeDto } from '@/modules/resumes/dto/update-resume.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetPublicResumesDto } from '@/modules/resumes/dto/get-public-resumes.dto';

@Injectable()
export class ResumesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllPublicItems(
    getPublicResumesDto: GetPublicResumesDto,
  ): Promise<{ items: ResumeItem[]; total: number }> {
    const { page, limit, order, sort, minCareerYear, maxCareerYear, groupId } =
      getPublicResumesDto;
    const whereOptions: Prisma.ResumeWhereInput = {
      isPublic: true,
      deletedAt: null,
      ...((minCareerYear !== undefined || maxCareerYear !== undefined) && {
        careerYears: {
          gte: minCareerYear ?? 0,
          lte: maxCareerYear ?? 1000,
        },
      }),
      ...(groupId && { category: { groupId } }),
    };
    const [items, total]: [ResumeItem[], number] =
      await this.prismaService.$transaction([
        this.prismaService.resume.findMany({
          where: whereOptions,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sort]: order },
          include: { category: { include: { group: true } } },
        }),
        this.prismaService.resume.count({ where: whereOptions }),
      ]);
    return { items, total };
  }

  async findPublicItemById(id: string): Promise<ResumeItem | null> {
    return this.prismaService.resume.findUnique({
      where: { id, deletedAt: null, isPublic: true },
      include: { category: { include: { group: true } } },
    });
  }

  async findItemById(id: string): Promise<ResumeItem | null> {
    return this.prismaService.resume.findUnique({
      where: { id, deletedAt: null },
      include: { category: { include: { group: true } } },
    });
  }

  async findAll(
    user: User,
    { limit, page, order, sort }: PaginationDto,
  ): Promise<{ items: ResumeItem[]; total: number }> {
    const whereOptions: Prisma.ResumeWhereInput = {
      userId: user.id,
      deletedAt: null,
    };
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.resume.findMany({
        where: whereOptions,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
        include: { category: { include: { group: true } } },
      }),
      this.prismaService.resume.count({ where: whereOptions }),
    ]);
    return { total, items };
  }

  async createItem(
    user: User,
    createResumeDto: CreateResumeDto,
  ): Promise<Resume> {
    return this.prismaService.resume.create({
      data: {
        userId: user.id,
        ...createResumeDto,
      },
    });
  }

  // TODO: isPublic 을 true로 할 때 필수값 검증 (title, description 등등)
  async updateItem(
    id: string,
    updateResumeDto: UpdateResumeDto,
  ): Promise<Resume> {
    return this.prismaService.resume.update({
      where: { id, deletedAt: null },
      data: updateResumeDto,
    });
  }

  async deleteItem(id: string): Promise<void> {
    await this.prismaService.resume.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
