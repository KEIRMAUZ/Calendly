import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CalendlyModule } from './calendly/calendly.module';

@Module({
  imports: [ AuthModule, CalendlyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
