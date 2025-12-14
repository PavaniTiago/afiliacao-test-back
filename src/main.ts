import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    console.log('🚀 Starting application...');
    console.log('📋 Environment variables:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('  - PORT:', process.env.PORT || '3000');
    console.log('  - DB_HOST:', process.env.DB_HOST || 'not set');
    console.log('  - DB_NAME:', process.env.DB_NAME || 'not set');
    console.log(
      '  - AUTH_SECRET:',
      process.env.AUTH_SECRET ? '***set***' : 'not set',
    );

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    app.use(cookieParser());

    const allowedOrigins = [
      process.env.APP_URL || 'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:3333',
    ].filter(Boolean);

    console.log('🌐 CORS allowed origins:', allowedOrigins);

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      exposedHeaders: ['Set-Cookie'],
    });

    app.setGlobalPrefix('api');

    const port = process.env.PORT ?? 3000;
    await app.listen(port);

    console.log(`✅ Application is running on: http://0.0.0.0:${port}/api`);
    console.log(`🌐 Health check: http://0.0.0.0:${port}/api/health`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

void bootstrap();
