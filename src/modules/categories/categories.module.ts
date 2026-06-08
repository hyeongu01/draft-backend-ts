import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { UsersService } from '@/modules/users/users.service';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService, UsersService],
})
export class CategoriesModule {}
