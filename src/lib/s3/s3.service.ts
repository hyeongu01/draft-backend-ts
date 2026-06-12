import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import CONFIG from '@/config/config';
import sharp from 'sharp';

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
    filePath: string,
  ): Promise<string> {
    const fileName = `${filePath}/512x512.webp`;
    const bufferImage = await sharp(file.buffer)
      .rotate()
      .resize(512, 512, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
    await this.client.send(
      new PutObjectCommand({
        Bucket: CONFIG.r2.bucketName,
        Key: fileName,
        Body: bufferImage,
        ContentType: 'image/webp',
      }),
    );
    return `${CONFIG.r2.publicUrl}/${fileName}`;
  }
}
