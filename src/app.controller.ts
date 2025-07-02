import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return {
      message: this.appService.getHello(),
      status: 'success',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        auth: {
          google: '/auth/google',
          status: '/auth/status',
          logout: '/auth/logout',
          profile: '/auth/profile'
        },
        calendly: {
          events: '/calendly/events'
        }
      }
    };
  }
}
