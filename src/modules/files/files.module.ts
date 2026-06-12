import { FilesController } from '@/modules/files/files.controller';
import { Module } from '@nestjs/common';
import { S3Module } from '@/lib/s3/s3.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';

@Module({
  imports: [S3Module, PrismaModule, UsersModule],
  controllers: [FilesController],
})
export class FilesModule {}
