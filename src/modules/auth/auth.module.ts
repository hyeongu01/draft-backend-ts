import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleAuthService } from '@/lib/authService/google-auth.service';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthService],
})
export class AuthModule {}
