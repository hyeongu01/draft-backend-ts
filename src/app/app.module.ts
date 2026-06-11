import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ResumesModule } from '@/modules/resumes/resumes.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { FilesModule } from '@/modules/files/files.module';

@Module({
  imports: [
    JwtModule.register({ global: true }),
    UsersModule,
    AuthModule,
    ResumesModule,
    CategoriesModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
