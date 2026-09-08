import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const enableSwagger = configService.get<string>('ENABLE_SWAGGER', 'true');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  // Enable Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // HTTP Security Headers (Helmet)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Global Validation Pipe
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

  // CORS Configuration
  const allowedOrigins =
    corsOrigin === '*'
      ? '*'
      : corsOrigin.split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Documentation Setup (Configurable in Production)
  if (enableSwagger === 'true' || nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Movie Web API')
      .setDescription('REST API for Movie Web - Movies, Genres, Episodes, Favorites, History, Admin')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger API Docs available at: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  logger.log(`Backend Application (${nodeEnv}) is running on: http://localhost:${port}`);
  logger.log(`Health Check endpoint: http://localhost:${port}/health`);
}

bootstrap();

