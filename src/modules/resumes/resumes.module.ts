import { Module } from '@nestjs/common';
import { ResumesController } from '@/modules/resumes/resumes.controller';
import { ResumesService } from './resumes.service';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';
import { PublicResumesController } from '@/modules/resumes/public-resumes.controller';
import { ResumeReactionsController } from '@/modules/resumes/resume-reactions.controller';
import { ResumeReactionsService } from '@/modules/resumes/resume-reactions.service';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [
    ResumesController,
    PublicResumesController,
    ResumeReactionsController,
  ],
  providers: [ResumesService, ResumeReactionsService],
})
export class ResumesModule {}
