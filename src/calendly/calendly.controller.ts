import { Controller, Post, Body, Headers } from '@nestjs/common';

@Controller('calendly')
export class CalendlyController {

    @Post('/event')
    handleCalendlyEvent(@Body() payload: any, @Headers() headers: any) {
    console.log('Evento recibido de Calendly:', payload);

    return { status: 'ok' };
  }
}



