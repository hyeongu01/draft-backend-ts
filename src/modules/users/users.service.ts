import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { type User } from '@/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findOneById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id } });
  }
}
