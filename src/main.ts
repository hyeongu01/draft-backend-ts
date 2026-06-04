import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import CONFIG from '@/config/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
