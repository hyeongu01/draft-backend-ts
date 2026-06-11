import { Module } from '@nestjs/common';
import { ResumesController } from '@/modules/resumes/resumes.controller';
import { ResumesService } from './resumes.service';
import { UsersService } from '@/modules/users/users.service';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';
import { PublicResumesController } from '@/modules/resumes/public-resumes.controller';
import { ResumeReactionsController } from '@/modules/resumes/resume-reactions.controller';
import { ResumeReactionsService } from '@/modules/resumes/resume-reactions.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    ResumesController,
    PublicResumesController,
    ResumeReactionsController,
  ],
  providers: [ResumesService, UsersService, ResumeReactionsService],
})
export class ResumesModule {}
