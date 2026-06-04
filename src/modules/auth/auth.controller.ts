import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthService } from '@/lib/authService/google-auth.service';
import { ResponseSuccess } from '@/common/types/response.type';
import { LoginResponseType } from '@/modules/auth/type/login-response.type';
import { RefreshDto } from '@/modules/auth/dto/refresh.dto';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import type { User } from '@/prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  ApiExcludeEndpoint,
  ApiExtraModels,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Get('google')
  @Redirect()
  @ApiOperation({
    summary: '구글 로그인',
    description: '구글 OAuth 동의 화면으로 302 리다이렉트 합니다.',
  })
  @ApiFoundResponse({
    description: '구글 OAuth 인증 페이지로 리다이렉트',
    headers: {
      Location: {
        description: '리다이렉트 될 구글 인증 URL',
        schema: {
          type: 'string',
          example: "'https://accounts.google.com/o/oauth2/v2/auth?...",
        },
      },
    },
  })
  googleLogin() {
    return { url: this.googleAuthService.getAuthUrl() };
  }

  @Get('google/callback')
  @ApiExcludeEndpoint()
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
  @HttpCode(200)
  @ApiOperation({ summary: 'access token 재발급' })
  @ApiExtraModels(ResponseSuccess, LoginResponseType)
  @ApiOkResponse({
    description: 'Success',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseSuccess) },
        { properties: { data: { $ref: getSchemaPath(LoginResponseType) } } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  async refresh(
    @Body() refreshDto: RefreshDto,
  ): Promise<ResponseSuccess<LoginResponseType>> {
    const data: LoginResponseType = await this.authService.refresh(
      refreshDto.token,
    );
    return ResponseSuccess.ok<LoginResponseType>(data);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async logout(@CurrentUser() user: User) {
    await this.authService.logout(user);
    return ResponseSuccess.ok({});
  }
}
