import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import CONFIG from '@/config/config';
import sharp from 'sharp';
import { ulid } from 'ulid';

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

  getProfileImagePath(id?: string): string {
    return `temp/${id ?? ulid()}`;
  }

  getUserProfileImagePath(userId: string): string {
    return `profiles/${userId}`;
  }

  private keyFromPublicUrl(publicUrl: string): string {
    const base = `${CONFIG.r2.publicUrl}/`;
    if (!publicUrl.startsWith(base))
      throw new BadRequestException('유효하지 않은 파일 URL 입니다.');
    const key = publicUrl.slice(base.length);
    // `..`은 경로 정규화로 다른 키를 가리킬 수 있고, ?/#은 요청 시 쿼리/프래그먼트로 해석됨
    if (key.includes('..') || key.includes('?') || key.includes('#'))
      throw new BadRequestException('유효하지 않은 파일 URL 입니다.');
    return key;
  }

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

  async moveFile(userId: string, targetPublicUrl: string): Promise<string> {
    const targetKey = this.keyFromPublicUrl(targetPublicUrl);
    if (!targetKey.startsWith('temp/'))
      throw new BadRequestException('임시 업로드된 파일만 등록할 수 있습니다.');
    const destinationKey = `${this.getUserProfileImagePath(userId)}/${targetKey.slice('temp/'.length)}`;

    try {
      await this.client.send(
        new CopyObjectCommand({
          Bucket: CONFIG.r2.bucketName,
          Key: destinationKey,
          CopySource: `${CONFIG.r2.bucketName}/${targetKey}`,
        }),
      );
    } catch (e) {
      if (e instanceof NoSuchKey)
        throw new BadRequestException(
          '임시 파일이 존재하지 않습니다. 다시 업로드해주세요',
        );
      throw e;
    }
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: CONFIG.r2.bucketName,
        Key: targetKey,
      }),
    );
    return `${CONFIG.r2.publicUrl}/${destinationKey}`;
  }

  async deleteFile(targetPublicUrl: string): Promise<void> {
    const targetKey = this.keyFromPublicUrl(targetPublicUrl);
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: CONFIG.r2.bucketName,
        Key: targetKey,
      }),
    );
  }
}
