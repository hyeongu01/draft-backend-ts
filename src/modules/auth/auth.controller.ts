import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
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
import CONFIG from '@/config/config';
import {
  ApiExcludeEndpoint,
  ApiExtraModels,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
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

  @Get('google/callback')
  @ApiExcludeEndpoint()
  async googleOAuthCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    if (!code) throw new BadRequestException('code not found');
    const payload = await this.googleAuthService.exchangeCode(code);
    if (!payload) throw new BadRequestException('payload not found');

    const { sub: providerId, name: nickname, email } = payload;
    if (nickname === undefined)
      throw new BadRequestException('nickname not found');
    if (email === undefined) throw new BadRequestException('email not found');

    // login 시작 시 심어둔 device_id 쿠키를 읽음 (없으면 신규 발급)
    const deviceId: string =
      req.cookies?.[CONFIG.cookie.deviceIdName] ?? randomUUID();

    const { accessToken, refreshToken }: LoginResponseType =
      await this.authService.login({
        providerId,
        nickname,
        email,
        provider: 'google',
        deviceId,
      });

    // refreshToken 은 HttpOnly 쿠키로, accessToken 은 해시(#)로 프론트에 전달
    res.cookie(
      CONFIG.cookie.refreshTokenName,
      refreshToken,
      this.refreshTokenCookieOptions(),
    );
    const redirectUrl = `${CONFIG.FRONTEND_URL}/auth/callback#accessToken=${encodeURIComponent(
      accessToken,
    )}`;
    return res.redirect(redirectUrl);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'access token 재발급',
    description:
      'refresh_token HttpOnly 쿠키로 재발급. 새 refreshToken 은 쿠키로 회전되고, 바디엔 accessToken 만 반환합니다.',
  })
  @ApiExtraModels(ResponseSuccess, AccessTokenResponseType)
  @ApiOkResponse({
    description: 'Success',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseSuccess) },
        {
          properties: {
            data: { $ref: getSchemaPath(AccessTokenResponseType) },
          },
        },
      ],
    },
  })
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
    });
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user);
    // refresh_token 쿠키 제거 (set 과 동일한 domain/path 여야 삭제됨)
    res.clearCookie(CONFIG.cookie.refreshTokenName, {
      domain: CONFIG.cookie.domain,
      path: '/auth',
    });
    return ResponseSuccess.ok({});
  }
}
