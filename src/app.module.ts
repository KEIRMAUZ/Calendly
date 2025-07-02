import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CalendlyModule } from './calendly/calendly.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule, 
    CalendlyModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: []
})
export class AppModule {}
