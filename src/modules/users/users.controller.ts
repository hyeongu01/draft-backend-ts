import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseSuccess } from '@/common/types/response.type';
import { type User } from '@/prisma/client';
import { UsersService } from '@/modules/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getMyProfile(@CurrentUser() user: User): ResponseSuccess<User> {
    return ResponseSuccess.ok(user);
  }
}
