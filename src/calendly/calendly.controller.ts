import { Controller,Res, Post, Body, Headers ,Query,Get, UseGuards} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CalendlyService } from './calendly.service';
import { JWTAccess } from 'google-auth-library';

@Controller('calendly')
@UseGuards(JWTAccess)
export class CalendlyController {
  constructor(private configService:ConfigService, private calendlyService:CalendlyService){}

    @Post('/event')
    handleCalendlyEvent(@Body() payload: any, @Headers() headers: any) {
    console.log('Evento recibido de Calendly:', payload);

    return { status: 'ok' };
  }

  @Get('connect')
  connect(@Res() res: Response){
    const authUrl = `https://auth.calendly.com/oauth/authorize?CLIENT_ID=${this.configService.get('CLIENT_ID')}&response_type=code&redirect_url=${this.configService.get('Redirect_url')}`
    res.redirect(authUrl);
  }

  @Get('callback')
  async callback(@Query('code') code:string){
    const access_token = await this.calendlyService.getAccessToken(code);
    const userInfo = await this.calendlyService.getUserInfo(access_token);
    return {success:true,data:userInfo}
  }
}



