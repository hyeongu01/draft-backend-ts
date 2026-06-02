import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { TestsModule } from '@/modules/tests/tests.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, TestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
