import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para solo aceptar peticiones del frontend de Vite con React
  app.enableCors({
    origin: [
      'http://localhost:5173', // Puerto por defecto de Vite
      'http://127.0.0.1:5173', // Alternativa localhost
      'http://localhost:4173', // Puerto de preview de Vite
      'http://127.0.0.1:4173', // Alternativa preview
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    credentials: true, // Permitir cookies y headers de autenticación
    optionsSuccessStatus: 200, // Para compatibilidad con navegadores antiguos
  });

  // Configurar cookie parser
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend running on port ${process.env.PORT ?? 3000}`);
  console.log(`📱 Frontend should be running on http://localhost:5173`);
  console.log(`🔐 Google Auth available at http://localhost:3000/auth/google`);
}
bootstrap();
