import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { LoginParamsDto } from '@/modules/auth/dto/login-params.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/prisma/client';
import { createHash } from 'crypto';
import CONFIG from '@/config/config';
import { type LoginResponseType } from '@/modules/auth/type/loginResponse.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
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
      },
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async login(params: LoginParamsDto): Promise<LoginResponseType> {
    const { provider, providerId, nickname, email } = params;

    let { user } = (await this.prismaService.userAuth.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      select: { user: true },
    })) ?? { user: null };

    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          nickname,
          email,
          auths: {
            create: {
              provider,
              providerId,
            },
          },
        },
      });
    }

    return this.generateToken(user);
  }
}
