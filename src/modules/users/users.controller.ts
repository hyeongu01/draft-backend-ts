import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  ResponsePaginatedSuccess,
  ResponseSuccess,
} from '@/common/types/response.type';
import { ResumeLike, ResumeScrap, type User } from '@/prisma/client';
import { UsersService } from '@/modules/users/users.service';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserResponseType } from '@/modules/users/type/user-response.type';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import { IdsResponseType } from '@/modules/users/type/ids-response.type';
import { ApiResponsePaginatedSuccess } from '@/common/decorators/api-response-paginated-success.decorator';
import { ResumeResponseType } from '@/modules/resumes/type/resume-response.type';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponseSuccess(UserResponseType)
  getMyProfile(@CurrentUser() user: User): ResponseSuccess<UserResponseType> {
    return ResponseSuccess.ok(UserResponseType.fromUser(user));
  }

  @Put('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'update user',
    description:
      '현재 로그인한 유저의 프로필을 수정합니다. 전달한 필드만 부분 수정됩니다. ' +
      'nickname: 2~100자. ' +
      'profileImageUrl: 파일 업로드 API(POST /files/profile-image/upload)가 반환한 임시(temp) URL을 전달하면 ' +
      '영구 경로("{R2 공개 URL}/profiles/{userId}/...")로 이동되어 저장되며, 응답에는 이동된 최종 URL이 담깁니다. ' +
      'null을 전달하면 프로필 이미지가 해제됩니다. ' +
      '이미지 변경/해제 시 이전 이미지는 R2에서 삭제됩니다.',
  })
  @ApiResponseSuccess(UserResponseType)
  @ApiBadRequestResponse({
    description:
      'profileImageUrl이 유효하지 않은 경우 — 버킷 외부 URL이거나, temp URL이 아니거나, ' +
      '임시 파일이 만료/삭제되어 존재하지 않는 경우(다시 업로드 필요)',
  })
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseSuccess<UserResponseType>> {
    const updatedUser: User = await this.usersService.updateItem(
      user,
      updateUserDto,
    );
    return ResponseSuccess.ok(UserResponseType.fromUser(updatedUser));
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponseSuccess()
  async deleteMyProfile(
    @CurrentUser() user: User,
  ): Promise<ResponseSuccess<{}>> {
    await this.usersService.deleteItem(user.id);
    return ResponseSuccess.ok({});
  }

  @Get('me/likes')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "user's likes resume ids",
    description:
      '현재 로그인한 유저가 좋아요한 이력서의 id 목록을 반환합니다. 목록 화면에서 좋아요 상태를 표시할 때 대조 용도로 사용합니다. ' +
      '인증이 필요하며, 좋아요한 이력서가 없으면 빈 배열을 반환합니다.',
  })
  @ApiResponseSuccess(IdsResponseType)
  async getLikeIds(
    @CurrentUser() user: User,
  ): Promise<ResponseSuccess<IdsResponseType>> {
    const items: ResumeLike[] = await this.usersService.findAllLikes(user.id);
    return ResponseSuccess.ok({
      ids: items.map((item) => item.resumeId),
    });
  }

  @Get('me/scraps')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "user's scraps resume ids",
    description:
      '현재 로그인한 유저가 스크랩한 이력서의 id 목록을 반환합니다. 목록 화면에서 스크랩 상태를 표시할 때 대조 용도로 사용합니다. ' +
      '인증이 필요하며, 스크랩한 이력서가 없으면 빈 배열을 반환합니다.',
  })
  @ApiResponseSuccess(IdsResponseType)
  async getScrapIds(@CurrentUser() user: User) {
    const items: ResumeScrap[] = await this.usersService.findAllScraps(user.id);
    return ResponseSuccess.ok({
      ids: items.map((item) => item.resumeId),
    });
  }

  @Get('me/likes/resumes')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "user's liked resumes",
    description:
      '현재 로그인한 유저가 좋아요한 이력서 목록을 페이지네이션으로 반환합니다. ' +
      '공개(isPublic=true) 상태인 이력서만 포함되며, 좋아요 이후 비공개로 전환되거나 삭제된 이력서는 목록에서 제외됩니다. ' +
      'page/limit/sort/order 쿼리 파라미터로 페이지와 정렬을 제어하고, 좋아요한 이력서가 없으면 빈 배열을 반환합니다.',
  })
  @ApiResponsePaginatedSuccess(ResumeResponseType)
  async getLikeResumes(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ): Promise<ResponsePaginatedSuccess<ResumeResponseType>> {
    const { items, total } = await this.usersService.findAllLikeResumes(
      user.id,
      paginationDto,
    );
    return new ResponsePaginatedSuccess<ResumeResponseType>(
      items.map(ResumeResponseType.fromResume),
      {
        ...paginationDto,
        total,
      },
    );
  }
}
