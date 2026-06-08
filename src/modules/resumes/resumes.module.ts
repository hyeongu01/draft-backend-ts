import { Module } from '@nestjs/common';
import { ResumesController } from '@/modules/resumes/resumes.controller';
import { ResumesService } from './resumes.service';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { UsersService } from '@/modules/users/users.service';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService, PrismaService, UsersService],
})
export class ResumesModule {}
