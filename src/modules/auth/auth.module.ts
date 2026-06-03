import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleAuthService } from '@/lib/authService/google-auth.service';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [PrismaModule, JwtModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthService],
})
export class AuthModule {}
