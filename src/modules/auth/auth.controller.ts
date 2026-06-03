import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthService } from '@/lib/authService/google-auth.service';
import { ResponseSuccess } from '@/common/types/response.type';
import { LoginResponseType } from '@/modules/auth/type/loginResponse.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Get('/google')
  @Redirect()
  googleLogin() {
    return { url: this.googleAuthService.getAuthUrl() };
  }

  @Get('/google/callback')
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
}
