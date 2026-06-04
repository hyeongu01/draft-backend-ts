import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import CONFIG from '@/config/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: CONFIG.FRONTEND_URL,
    credentials: true, // 쿠키(refresh_token, device_id) 송수신 허용
  });
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
  const config = new DocumentBuilder()
    .setTitle('Draft Backend TS')
    .setDescription('Draft Backend TS')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'local')
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory, {
    jsonDocumentUrl: 'docs',
  });

  await app.listen(CONFIG.PORT);
}
bootstrap().then(() => {
  console.log(`Server started on port ${CONFIG.PORT}`);
});
