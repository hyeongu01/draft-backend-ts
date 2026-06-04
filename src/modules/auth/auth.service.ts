import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { LoginParamsDto } from '@/modules/auth/dto/login-params.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from '@/prisma/client';
import { createHash } from 'crypto';
import CONFIG from '@/config/config';
import { type LoginResponseType } from '@/modules/auth/type/loginResponse.type';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateToken(user: User): Promise<LoginResponseType> {
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
          deviceId: 'sample',
        },
      },
      create: {
        userId: user.id,
        deviceId: 'sample',
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
    };
  }

  private async upsertUserAuth(params: LoginParamsDto): Promise<User> {
    const { provider, providerId, nickname, email } = params;
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
          create: {
            nickname,
            email,
          },
        },
      },
      update: {},
      select: { user: true },
    });
    return user;
  }

  async login(params: LoginParamsDto): Promise<LoginResponseType> {
    const user: User = await this.upsertUserAuth(params);
    return this.generateToken(user);
  }

  async refresh(token: string): Promise<LoginResponseType> {
    let id: string;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: CONFIG.jwt.refreshSecret,
      });
      id = payload.id;
    } catch {
      throw new UnauthorizedException('token 이 유효하지 않습니다.');
    }

    const user: User | null = await this.usersService.findOneById(id);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    const hashedToken: string = createHash('sha256')
      .update(token)
      .digest('hex');
    const oldToken: RefreshToken | null =
      await this.prismaService.refreshToken.findFirst({
        where: { token: hashedToken, revokedAt: null },
      });
    if (!oldToken) throw new NotFoundException('비활성화된 토큰입니다.');
    return this.generateToken(user);
  }

  async logout(user: User): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revokedAt: new Date() },
    });
  }
}
