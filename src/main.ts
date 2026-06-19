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
      transform: true, // 요청을 DTO 인스턴스로 변환 → 기본값 주입 + 타입 변환(@Type) 적용
      // stopAtFirstError: true,
      // exceptionFactory: (errors) =>
      //   new BadRequestException(
      //     errors[0].constraints?.[Object.keys(errors[0].constraints)[0]],
      //   ),
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Draft Backend TS')
    .setDescription(
      'Draft Backend TS\n\n' +
        '※ category 는 일반 유저가 생성/수정/삭제할 수 없으며 조회만 가능합니다. ' +
        'category 관리(생성·수정·삭제)는 추후 AdminJS 기반 관리자 도구를 통해 제공될 예정입니다.',
    )
    .setVersion(`${process.env.npm_package_version}`)
    .addBearerAuth()
    .addServer(`http://localhost:${CONFIG.PORT}`, 'local')
    .addServer('https://draft-be.choihw.me', 'deploy server')
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
