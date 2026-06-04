import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import CONFIG from '@/config/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // stopAtFirstError: true,
      // exceptionFactory: (errors) =>
      //   new BadRequestException(
      //     errors[0].constraints?.[Object.keys(errors[0].constraints)[0]],
      //   ),
    }),
  );
  await app.listen(CONFIG.PORT);
}
bootstrap().then(() => {
  console.log(`Server started on port ${CONFIG.PORT}`);
});
