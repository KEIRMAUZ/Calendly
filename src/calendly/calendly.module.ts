import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CalendlyController } from './calendly.controller';
import { CalendlyService } from './calendly.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema }
    ])
  ],
  controllers: [CalendlyController],
  providers: [CalendlyService],
  exports: [CalendlyService]
})
export class CalendlyModule {} 