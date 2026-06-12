import { FilesController } from '@/modules/files/files.controller';
import { Module } from '@nestjs/common';
import { S3Module } from '@/lib/s3/s3.module';
import { UsersService } from '@/modules/users/users.service';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';

@Module({
  imports: [S3Module, PrismaModule],
  controllers: [FilesController],
  providers: [UsersService],
})
export class FilesModule {}
