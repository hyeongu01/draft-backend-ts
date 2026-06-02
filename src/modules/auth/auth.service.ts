import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { LoginParamsDto } from '@/modules/auth/dto/login-params.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(params: LoginParamsDto) {
    const user: User =
      (await this.prismaService.userAuth.findUnique({
        where: {
          provider_providerId: {
            provider: params.provider,
            providerId: params.providerId,
          },
        },
        select: { user: true },
      })) ??
      (await this.prismaService.user.create({
        data: {
          nickname: params.nickname,
          email: params.email,

          auths: {
            create: {
              provider: params.provider,
              providerId: params.providerId,
            },
          },
        },
      }));

    // jwt 토큰 발급
    return {
      message: 'Logged in',
    };
  }
}
