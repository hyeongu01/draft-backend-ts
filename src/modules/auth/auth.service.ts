import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { type LoginParamsType } from '@/modules/auth/type/login-params.type';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { RefreshToken, User } from '@/prisma/client';
import { createHash } from 'crypto';
import CONFIG from '@/config/config';
import { type LoginResponseType } from '@/modules/auth/type/login-response.type';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateToken(
    user: User,
    deviceId: string,
  ): Promise<LoginResponseType> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: user.id },
        {
          expiresIn: CONFIG.jwt.accessExpiresIn,
          secret: CONFIG.jwt.accessSecret,
        },
      ),
      this.jwtService.signAsync(
        { id: user.id },
        {
          expiresIn: CONFIG.jwt.refreshExpiresIn,
          secret: CONFIG.jwt.refreshSecret,
        },
      ),
    ]);

    const hashedRefreshToken: string = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.prismaService.refreshToken.upsert({
      where: {
        deviceId_userId: {
          userId: user.id,
          deviceId,
        },
      },
      create: {
        userId: user.id,
        deviceId,
        token: hashedRefreshToken,
      },
      update: {
        token: hashedRefreshToken,
        revokedAt: null,
      },
    });
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private async upsertUserAuth(params: LoginParamsType): Promise<User> {
    const { provider, providerId, name, email } = params;
    const { user } = await this.prismaService.userAuth.upsert({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      create: {
        provider,
        providerId,
        user: {
          create: { name, email },
        },
      },
      update: {},
      select: { user: true },
    });
    return user;
  }

  async login(params: LoginParamsType): Promise<LoginResponseType> {
    const user: User = await this.upsertUserAuth(params);
    const { accessToken, refreshToken } = await this.generateToken(
      user,
      params.deviceId,
    );
    return { accessToken, refreshToken, user };
  }

  async refresh(token: string, deviceId: string): Promise<LoginResponseType> {
    let id: string;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: CONFIG.jwt.refreshSecret,
      });
      id = payload.id;
    } catch (e) {
      if (e instanceof TokenExpiredError)
        throw new UnauthorizedException('refresh 토큰이 만료되었습니다.');
      throw new UnauthorizedException('token 이 유효하지 않습니다.');
    }

    const user: User | null = await this.usersService.findOneById(id);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    const hashedToken: string = createHash('sha256')
      .update(token)
      .digest('hex');
    const oldToken: RefreshToken | null =
      await this.prismaService.refreshToken.findUnique({
        where: { deviceId_userId: { deviceId, userId: user.id } },
      });

    // TODO: refresh 토큰 탈취 문제 (공격자가 토큰 탈취 -> 실제 유저보다 먼저 refresh => 공격자는 앞으로 자유롭게 갱신 가능)
    if (!oldToken || oldToken.revokedAt || oldToken.token !== hashedToken)
      throw new NotFoundException('비활성화된 토큰입니다.');
    return this.generateToken(user, deviceId);
  }

  async logout(user: User, deviceId: string | undefined): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: {
        userId: user.id,
        ...(deviceId && { deviceId }),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}
