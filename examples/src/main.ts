import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for development
  app.enableCors();
  
  // Change port to 3001 to avoid conflicts
  await app.listen(3009);
  
  console.log('🚀 Application is running on: http://localhost:3009');
  console.log('📊 Health check: http://localhost:3009/health');
  console.log('👤 User service: http://localhost:3009/users');
  console.log('📦 Order service: http://localhost:3009/orders');
}
bootstrap();
