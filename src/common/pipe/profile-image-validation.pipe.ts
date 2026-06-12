import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

@Injectable()
export class ProfileImageValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File | undefined): Express.Multer.File {
    if (!file) throw new BadRequestException('파일이 없습니다.');
    if (file.size > MAX_FILE_SIZE)
      throw new BadRequestException('파일 크기는 5MB를 초과할 수 없습니다.');
    if (!ALLOWED_MIMETYPES.includes(file.mimetype))
      throw new BadRequestException(
        `지원하지 않는 이미지 형식입니다. (지원: ${ALLOWED_MIMETYPES.join(', ')})`,
      );
    return file;
  }
}
