import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Permite que o frontend (porta 3000) faça pedidos ao backend
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // 2. Muda a porta do backend para 3001 para não chocar com o Next.js
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
