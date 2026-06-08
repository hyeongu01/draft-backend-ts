import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthService } from '@/lib/authService/google-auth.service';
import { ResponseSuccess } from '@/common/types/response.type';
import {
  AccessTokenResponseType,
  LoginResponseType,
} from '@/modules/auth/type/login-response.type';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import type { User } from '@/prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GoogleCallbackDto } from '@/modules/auth/dto/google-callback.dto';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import CONFIG from '@/config/config';
import {
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserResponseType } from '@/modules/users/type/user-response.type';

@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  private deviceIdCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: CONFIG.cookie.secure,
      sameSite: 'lax',
      domain: CONFIG.cookie.domain,
      path: '/',
      maxAge: CONFIG.cookie.deviceIdMaxAge,
    };
  }

  // refresh_token 은 /auth 경로로 한정해 노출 표면을 줄임. set/clear 모두 동일 옵션 사용
  private refreshTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: CONFIG.cookie.secure,
      sameSite: 'lax',
      domain: CONFIG.cookie.domain,
      path: '/auth',
      maxAge: CONFIG.cookie.refreshMaxAge,
    };
  }

  @Get('google/login')
  @ApiOperation({
    summary: '구글 로그인',
    description:
      'device_id HttpOnly 쿠키를 설정하고 구글 OAuth 동의 화면으로 302 리다이렉트 합니다.',
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
  googleLogin(@Req() req: Request, @Res() res: Response) {
    // 같은 브라우저에서 재로그인 시 기존 device_id 를 유지해 기기 식별을 안정화
    const deviceId: string =
      req.cookies?.[CONFIG.cookie.deviceIdName] ?? randomUUID();
    res.cookie(
      CONFIG.cookie.deviceIdName,
      deviceId,
      this.deviceIdCookieOptions(),
    );
    return res.redirect(this.googleAuthService.getAuthUrl());
  }

  @Post('google/callback')
  @HttpCode(200)
  @ApiOperation({
    summary: '구글 로그인 콜백',
    description:
      'google oAuth 는 client 의 callback 으로 리다이렉트 되고, 온보딩에서 입력한 닉네임과 인가 코드를 바디로 받아 로그인을 마친다. refreshToken 은 쿠키로, accessToken, user 은 바디로 반환합니다.',
  })
  @ApiResponseSuccess(AccessTokenResponseType)
  async googleOAuthCallback(
    @Body() { code }: GoogleCallbackDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseSuccess<AccessTokenResponseType>> {
    const payload = await this.googleAuthService.exchangeCode(code);
    if (!payload) throw new BadRequestException('payload not found');

    const { sub: providerId, email, name } = payload;
    if (email === undefined) throw new BadRequestException('email not found');
    if (name === undefined) throw new BadRequestException('name not found');

    // login 시작 시 심어둔 device_id 쿠키를 읽음 (없으면 신규 발급)
    const deviceId: string =
      req.cookies?.[CONFIG.cookie.deviceIdName] ?? randomUUID();

    const { accessToken, refreshToken, user }: LoginResponseType =
      await this.authService.login({
        providerId,
        name,
        email,
        provider: 'google',
        deviceId,
      });

    // refreshToken 은 HttpOnly 쿠키로 내려주고, accessToken 은 바디로 반환
    res.cookie(
      CONFIG.cookie.refreshTokenName,
      refreshToken,
      this.refreshTokenCookieOptions(),
    );
    return ResponseSuccess.ok<AccessTokenResponseType>({
      accessToken,
      user: UserResponseType.fromUser(user),
    });
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'access token 재발급',
    description:
      'refresh_token HttpOnly 쿠키로 재발급. 새 refreshToken 은 쿠키로 회전되고, 바디엔 accessToken, user 가 반환합니다.',
  })
  @ApiResponseSuccess(AccessTokenResponseType)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseSuccess<AccessTokenResponseType>> {
    const refreshToken: string | undefined =
      req.cookies?.[CONFIG.cookie.refreshTokenName];
    if (!refreshToken)
      throw new UnauthorizedException('refresh token 쿠키가 없습니다.');

    const deviceId: string =
      req.cookies?.[CONFIG.cookie.deviceIdName] ?? randomUUID();
    const data: LoginResponseType = await this.authService.refresh(
      refreshToken,
      deviceId,
    );

    // 회전된 refreshToken 을 다시 쿠키로 내려줌
    res.cookie(
      CONFIG.cookie.refreshTokenName,
      data.refreshToken,
      this.refreshTokenCookieOptions(),
    );
    return ResponseSuccess.ok<AccessTokenResponseType>({
      accessToken: data.accessToken,
      user: UserResponseType.fromUser(data.user),
    });
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'logout - 디바이스 로그아웃 / 유저 전체 로그아웃',
    description: `세션 쿠키에서 deviceId (key: ${CONFIG.cookie.deviceIdName}) 을 읽을 수 있는 경우 해당 디바이스 로그아웃. 그렇지 않은 경우 모든 디바이스에서 로그아웃`,
  })
  @ApiResponseSuccess()
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseSuccess<{}>> {
    const deviceId: string | undefined =
      req.cookies?.[CONFIG.cookie.deviceIdName];

    await this.authService.logout(user, deviceId);
    // refresh_token 쿠키 제거 (set 과 동일한 domain/path 여야 삭제됨)
    res.clearCookie(CONFIG.cookie.refreshTokenName, {
      domain: CONFIG.cookie.domain,
      path: '/auth',
    });
    return ResponseSuccess.ok({});
  }
}
