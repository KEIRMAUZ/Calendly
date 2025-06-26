import { Module } from '@nestjs/common';
import { CalendlyService } from './calendly.service';
import { CalendlyController } from './calendly.controller';

@Module({
  providers: [CalendlyService],
  controllers: [CalendlyController]
})
export class CalendlyModule {}
