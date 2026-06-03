import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorayors/current-user.decorator';
import { ResponseSuccess } from '@/common/types/response.type';
import { type User } from '@/prisma/client';

@Controller('users')
export class UsersController {
  constructor(private usersService: PrismaService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getMyProfile(@CurrentUser() user: User): ResponseSuccess<User> {
    return ResponseSuccess.ok(user);
  }
}
