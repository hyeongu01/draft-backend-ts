import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { LoginParamsDto } from '@/modules/auth/dto/login-params.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async login(params: LoginParamsDto) {
    await this.prismaService.user.create({
      data: {
        nickname: params.nickname,
        email: params.email,

        auths: {
          create: {
            provider: params.provider,
            providerId: params.provideId,
          },
        },
      },
    });

    // jwt 토큰 발급
    return {
      message: 'Logged in',
    };
  }
}
