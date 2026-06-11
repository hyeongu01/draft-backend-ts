import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseSuccess } from '@/common/types/response.type';
import { ResumeLike, ResumeScrap, type User } from '@/prisma/client';
import { UsersService } from '@/modules/users/users.service';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserResponseType } from '@/modules/users/type/user-response.type';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import { IdsResponseType } from '@/modules/users/type/ids-response.type';

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
  @ApiResponseSuccess()
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseSuccess<{}>> {
    await this.usersService.updateItem(user.id, updateUserDto);
    return ResponseSuccess.ok({});
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
}
