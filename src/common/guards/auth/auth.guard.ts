import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { type Request } from 'express';
import { User } from '@/prisma/client';
import CONFIG from '@/config/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token: string | undefined = this.extractJwtToken(request);
    if (!token) throw new UnauthorizedException('jwt 토큰이 없습니다.');

    let payload: { id: string };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: CONFIG.jwt.accessSecret,
      });
    } catch {
      throw new UnauthorizedException('jwt 토큰이 유효하지 않습니다.');
    }
    const user: User | null = await this.usersService.findOneById(payload.id);
    if (!user) throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    request['user'] = user;
    return true;
  }

  private extractJwtToken(req: Request) {
    const fullToken = req.headers?.authorization;
    if (!fullToken) return undefined;
    const [tokenType, token] = fullToken.split(' ');
    return tokenType.toLowerCase() === 'bearer' ? token : undefined;
  }
}
