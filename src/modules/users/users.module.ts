import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';
import { AuthGuardModule } from '@/common/guards/auth/auth-guard.module';

@Module({
  imports: [PrismaModule, AuthGuardModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
