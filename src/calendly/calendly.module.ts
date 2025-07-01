import { Module } from '@nestjs/common';
import { CalendlyService } from './calendly.service';
import { CalendlyController } from './calendly.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[
    HttpModule
  ],
  providers: [CalendlyService],
  controllers: [CalendlyController],
  exports:[CalendlyService],
})
export class CalendlyModule {}
