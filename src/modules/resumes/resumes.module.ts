import { Module } from '@nestjs/common';
import { ResumesController } from '@/modules/resumes/resumes.controller';
import { ResumesService } from './resumes.service';
import { UsersService } from '@/modules/users/users.service';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';
import { PublicResumesController } from '@/modules/resumes/public-resumes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ResumesController, PublicResumesController],
  providers: [ResumesService, UsersService],
})
export class ResumesModule {}
