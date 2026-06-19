import { Module } from '@nestjs/common';
import { ChatsController } from '@/modules/chats/chats.controller';
import { ChatsService } from '@/modules/chats/chats.service';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
