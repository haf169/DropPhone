import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files (audio)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const isDev = process.env.NODE_ENV !== 'production';

  // CORS
  app.enableCors({
    origin: isDev
      ? true  // Development: chấp nhận mọi origin
      : [
          'capacitor://localhost',
          'http://localhost',
          'http://localhost:3000',
          process.env.FRONTEND_URL,
        ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 DropPhone API running on: http://0.0.0.0:${port}/api`);
  console.log(`❤️  Health check: http://localhost:${port}/api/health`);
  console.log(`📁 Static files: http://localhost:${port}/uploads`);
}
bootstrap();

