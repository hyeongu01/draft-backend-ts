import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import CONFIG from '@/config/config';

@Injectable()
export class S3Service {
  private readonly client = new S3Client({
    region: 'auto',
    endpoint: `https://${CONFIG.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: CONFIG.r2.accessKeyId,
      secretAccessKey: CONFIG.r2.secretAccessKey,
    },
  });

  async uploadProfileImage(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: CONFIG.r2.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return `${CONFIG.r2.publicUrl}/${fileName}`;
  }
}
