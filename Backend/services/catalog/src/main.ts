import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get } from '@nestjs/common';

@Controller()
class AppController {
  @Get('health')
  health() {
    return { status: 'ok', service: process.env.SERVICE_NAME };
  }
}

@Module({ controllers: [AppController] })
class AppModule {}

async function bootstrap() {
  const port = parseInt(process.env.PORT || '3001', 10);
  const app = await NestFactory.create(AppModule);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
