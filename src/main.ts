import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // This will remove any properties that are not in the DTO
      // forbidNonWhitelisted: true, // This will throw an error if a property that is not in the DTO is sent
    }),
  );
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.info(`Server running on port ${PORT}`);
}
bootstrap();
