import { Module } from '@nestjs/common';
import { WsGateway } from '@/lib/ws/ws.gateway';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [WsGateway],
})
export class WsModule {}
