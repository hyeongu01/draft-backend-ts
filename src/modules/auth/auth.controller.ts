import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthService } from '@/lib/authService/google-auth.service';
import { ResponseSuccess } from '@/common/types/response.type';
import { LoginResponseType } from '@/modules/auth/type/loginResponse.type';
import { RefreshDto } from '@/modules/auth/dto/refresh.dto';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import type { User } from '@/prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Get('google')
  @Redirect()
  googleLogin() {
    return { url: this.googleAuthService.getAuthUrl() };
  }

  @Get('google/callback')
  async googleOAuthCallback(
    @Query('code') code: string,
  ): Promise<ResponseSuccess<LoginResponseType>> {
    if (!code) throw new BadRequestException('code not found');
    const payload = await this.googleAuthService.exchangeCode(code);
    if (!payload) throw new BadRequestException('payload not found');

    const { sub: providerId, name: nickname, email } = payload;
    if (nickname === undefined)
      throw new BadRequestException('nickname not found');
    if (email === undefined) throw new BadRequestException('email not found');

    const data: LoginResponseType = await this.authService.login({
      providerId,
      nickname,
      email,
      provider: 'google',
    });
    return ResponseSuccess.ok<LoginResponseType>(data);
  }

  @Post('refresh')
  async refresh(
    @Body() refreshDto: RefreshDto,
  ): Promise<ResponseSuccess<LoginResponseType>> {
    const data: LoginResponseType = await this.authService.refresh(
      refreshDto.token,
    );
    return ResponseSuccess.ok<LoginResponseType>(data);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@CurrentUser() user: User) {
    await this.authService.logout(user);
    return ResponseSuccess.ok({});
  }
}
