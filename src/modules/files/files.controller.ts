import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '@/lib/s3/s3.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import CONFIG from '@/config/config';

@Controller('files')
export class FilesController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const obj = new PutObjectCommand({
      Bucket: CONFIG.r2.bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await this.s3Service.client.send(obj);

    return { url: `${CONFIG.r2.publicUrl}/${file.originalname}` };
  }
}
