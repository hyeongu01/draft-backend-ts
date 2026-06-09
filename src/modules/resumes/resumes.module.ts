import { Module } from '@nestjs/common';
import { ResumesController } from '@/modules/resumes/resumes.controller';
import { ResumesService } from './resumes.service';
import { UsersService } from '@/modules/users/users.service';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResumesController],
  providers: [ResumesService, UsersService],
})
export class ResumesModule {}
