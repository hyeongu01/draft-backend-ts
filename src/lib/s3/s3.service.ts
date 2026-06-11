import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import CONFIG from '@/config/config';

@Injectable()
export class S3Service {
  public client = new S3Client({
    region: 'auto',
    endpoint: `https://${CONFIG.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: CONFIG.r2.accessKeyId,
      secretAccessKey: CONFIG.r2.secretAccessKey,
    },
  });
}