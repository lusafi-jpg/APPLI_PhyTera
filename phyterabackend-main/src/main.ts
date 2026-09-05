import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ValidationPipe globale pour les DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuration Swagger / OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('PhyTera Backend Central API')
    .setDescription(
      'Spécification OpenAPI du backend central PhyTera (NestJS, Prisma, PostgreSQL) pour la surveillance végétale intelligente et IoT.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-device-key', in: 'header' }, 'x-device-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Le Backend PhyTera NestJS tourne sur: http://localhost:${port}`);
  logger.log(`📚 Documentation Swagger API disponible sur: http://localhost:${port}/api/docs`);
  logger.log(`⚡ Namespace WebSockets Socket.io actif sur: ws://localhost:${port}/realtime`);
}

bootstrap();
