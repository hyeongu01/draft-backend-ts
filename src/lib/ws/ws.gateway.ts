import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import type { User } from '@/prisma/client';
import CONFIG from '@/config/config';

@WebSocketGateway({ namespace: 'ws/chats' })
export class WsGateway
  implements
    OnGatewayInit<Namespace>,
    OnGatewayConnection<Socket>,
    OnGatewayDisconnect<Socket>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Namespace;

  afterInit(server: Namespace) {}

  async handleConnection(client: Socket) {
    try {
      client.data.user = await this.authenticate(client);
    } catch {
      client.emit('error', '인증에 실패했습니다.');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {}

  private async authenticate(client: Socket): Promise<User> {
    const token = this.extractToken(client);
    if (!token) throw new Error('jwt 토큰이 없습니다.');

    const payload = await this.jwtService.verifyAsync<{ id: string }>(token, {
      secret: CONFIG.jwt.accessSecret,
    });
    const user = await this.usersService.findOneById(payload.id);
    if (!user) throw new Error('유저를 찾을 수 없습니다.');
    return user;
  }

  private extractToken(client: Socket): string | undefined {
    const raw =
      (client.handshake.auth?.token as string | undefined) ??
      client.handshake.headers.authorization;
    if (!raw) return undefined;
    const [type, token] = raw.split(' ');
    return type.toLowerCase() === 'bearer' ? token : raw;
  }
}
