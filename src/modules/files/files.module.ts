import { FilesController } from '@/modules/files/files.controller';
import { Module } from '@nestjs/common';
import { S3Module } from '@/lib/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [FilesController],
})
export class FilesModule {}
