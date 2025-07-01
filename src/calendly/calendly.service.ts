import { Injectable, } from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class CalendlyService {
    constructor(private httpService:HttpService, private configService:ConfigService){}

    async getAccessToken(code:string) {
      const params = new URLSearchParams();


      const clientId = this.configService.get('CLIENT_ID');
      const clientSecret = this.configService.get('Client_secret');
      const redirectUrl = this.configService.get('Redirect_url');

      if (!clientId || !clientSecret || !redirectUrl) {
        throw new Error('Missing required environment variables for Calendly OAuth');
      }
      params.append('grant_type','authorization_code');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('redirect_url',redirectUrl );
      params.append('code', code);
      const response = await this.httpService.axiosRef.post(
        'https://auth.calendly.com/oauth/token',
        params.toString(),{
          headers:{'Content-Type':'application/x-www-form-urlencoded'}
        });

        return response.data.access_token;
    }

    async getUserInfo(access_token:string ){
      const response = await this.httpService.axiosRef.get(
        '',
        {
          headers:{Authorization:`Bearer ${access_token}`}
        });
        return response.data
    }
}



