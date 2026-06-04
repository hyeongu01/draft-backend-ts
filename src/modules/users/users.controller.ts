import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseSuccess } from '@/common/types/response.type';
import { type User } from '@/prisma/client';
import { UsersService } from '@/modules/users/users.service';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getMyProfile(@CurrentUser() user: User): ResponseSuccess<User> {
    return ResponseSuccess.ok(user);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseSuccess<object>> {
    await this.usersService.updateItem(user.id, updateUserDto);
    return ResponseSuccess.ok({});
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  async deleteMyProfile(
    @CurrentUser() user: User,
  ): Promise<ResponseSuccess<object>> {
    await this.usersService.deleteItem(user.id);
    return ResponseSuccess.ok({});
  }
}
