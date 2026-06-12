import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { ResumeLike, ResumeScrap, type User } from '@/prisma/client';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { S3Service } from '@/lib/s3/s3.service';
import { ResumeItem } from '@/modules/resumes/resumes.type';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ResumeIncludePublicOptions } from '@/modules/resumes/resumes.service';
import { ResumeWhereInput } from '@/prisma/models/Resume';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async findOneById(id: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async updateItem(user: User, params: UpdateUserDto): Promise<User> {
    const data = { ...params };
    if (typeof params.profileImageUrl === 'string')
      data.profileImageUrl = await this.s3Service.moveFile(
        user.id,
        params.profileImageUrl,
      );
    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data,
    });
    // 이전 이미지 삭제는 DB 반영 성공 후에만, 실패해도 요청은 성공 처리 (고아 객체가 깨진 아바타보다 낫다)
    if (
      params.profileImageUrl !== undefined &&
      user.profileImageUrl &&
      user.profileImageUrl !== updatedUser.profileImageUrl
    )
      await this.s3Service.deleteFile(user.profileImageUrl).catch(() => {});
    return updatedUser;
  }

  async deleteItem(id: string): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.refreshToken.deleteMany({
        where: { userId: id },
      }),
      this.prismaService.userAuth.deleteMany({
        where: { userId: id },
      }),
      this.prismaService.user.update({
        where: { id },
        data: {
          email: `removed-${id}@deleted.local`,
          deletedAt: new Date(),
        },
      }),
    ]);
  }

  async findAllLikes(userId: string): Promise<ResumeLike[]> {
    return this.prismaService.resumeLike.findMany({
      where: { userId, resume: { deletedAt: null } },
    });
  }

  async findAllScraps(userId: string): Promise<ResumeScrap[]> {
    return this.prismaService.resumeScrap.findMany({
      where: { userId, resume: { deletedAt: null } },
    });
  }

  async findAllLikeResumes(
    userId: string,
    { page, limit, sort, order }: PaginationDto,
  ): Promise<{ items: ResumeItem[]; total: number }> {
    const whereOptions: ResumeWhereInput = {
      likes: { some: { userId } },
      deletedAt: null,
      isPublic: true,
    };

    const [items, total]: [items: ResumeItem[], total: number] =
      await this.prismaService.$transaction([
        this.prismaService.resume.findMany({
          where: whereOptions,
          include: ResumeIncludePublicOptions,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sort]: order },
        }),
        this.prismaService.resume.count({
          where: whereOptions,
        }),
      ]);
    return { items, total };
  }

  async findAllScrapResumes(
    userId: string,
    { page, limit, sort, order }: PaginationDto,
  ): Promise<{ items: ResumeItem[]; total: number }> {
    const whereOptions: ResumeWhereInput = {
      scraps: { some: { userId } },
      deletedAt: null,
      isPublic: true,
    };

    const [items, total]: [items: ResumeItem[], total: number] =
      await this.prismaService.$transaction([
        this.prismaService.resume.findMany({
          where: whereOptions,
          include: ResumeIncludePublicOptions,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sort]: order },
        }),
        this.prismaService.resume.count({
          where: whereOptions,
        }),
      ]);
    return { items, total };
  }
}
