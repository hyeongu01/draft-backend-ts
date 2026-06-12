import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '@/lib/s3/s3.service';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import type { User } from '@/prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseSuccess } from '@/common/types/response.type';
import { ProfileImageValidationPipe } from '@/common/pipe/profile-image-validation.pipe';
import { ulid } from 'ulid';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import { ProfileImageUploadResponseType } from '@/modules/files/type/profile-image-upload-response.type';

@Controller('files')
export class FilesController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('profile-image/upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload a profile image',
    description:
      '프로필 이미지를 512x512 webp로 리사이즈하여 임시(temp) 경로에 업로드하고 임시 공개 URL을 반환합니다. ' +
      'URL 형식: "{R2 공개 URL}/temp/{ulid}/512x512.webp" (업로드마다 ulid가 새로 생성됨). ' +
      '이 URL을 PUT /users/me의 profileImageUrl로 전달해야 영구 경로로 이동되어 프로필에 반영됩니다. ' +
      '허용 형식: jpeg/png/webp/gif/avif, 최대 5MB. ' +
      '추후 필요하다면 여러가지 사이즈로 저장 후 배열로 리턴하는 것도 고려중',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '프로필 이미지 (jpeg/png/webp/gif/avif, 최대 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponseSuccess(ProfileImageUploadResponseType)
  async uploadFile(
    @CurrentUser() user: User,
    @UploadedFile(ProfileImageValidationPipe) file: Express.Multer.File,
  ): Promise<ResponseSuccess<ProfileImageUploadResponseType>> {
    const filePath = this.s3Service.getProfileImagePath();
    const profileImageUrl: string = await this.s3Service.uploadProfileImage(
      file,
      filePath,
    );
    return ResponseSuccess.ok({ profileImageUrl });
  }
}
