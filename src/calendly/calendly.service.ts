import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class CalendlyService {
    constructor(private readonly httpService: HttpService) {}

  async getScheduledEvents() {
    const token = 'Bearer TU_TOKEN';
    const url = 'https://api.calendly.com/scheduled_events';

    const response = await this.httpService.axiosRef.get(url, {
      headers: { Authorization: token },
    });

    return response.data;
  }
}



