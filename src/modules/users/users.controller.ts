import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseSuccess } from '@/common/types/response.type';
import { type User } from '@/prisma/client';
import { UsersService } from '@/modules/users/users.service';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { ApiBearerAuth, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { UserResponseType } from '@/modules/users/type/user-response.type';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import { dateToDateFormatObject } from '@/common/date-format';

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
}
