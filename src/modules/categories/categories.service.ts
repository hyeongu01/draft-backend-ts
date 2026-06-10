import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { JobCategory, Prisma } from '@/prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ResponseSuccess } from '@/common/types/response.type';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllItems({ page, limit, sort, order }: PaginationDto) {
    const whereOptions: Prisma.JobCategoryWhereInput = { isActive: true };

    const [total, items] = await this.prismaService.$transaction([
      this.prismaService.jobCategory.count({ where: whereOptions }),
      this.prismaService.jobCategory.findMany({
        where: whereOptions,
        include: { group: true },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sort]: order },
      }),
    ]);
    return { items, total };
  }
}
