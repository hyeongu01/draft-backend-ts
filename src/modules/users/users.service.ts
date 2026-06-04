import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { type User } from '@/prisma/client';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { createHash } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findOneById(id: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async updateItem(id: string, params: UpdateUserDto): Promise<void> {
    await this.prismaService.user.update({
      where: { id },
      data: {
        ...params,
      },
    });
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
}
