import { Module } from '@nestjs/common';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { UsersService } from '@/modules/users/users.service';
import { PrismaModule } from '@/lib/prisma/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuthGuard, UsersService],
  exports: [AuthGuard],
})
export class AuthGuardModule {}
