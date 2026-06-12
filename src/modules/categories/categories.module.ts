import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
