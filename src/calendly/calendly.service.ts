import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CalendlyService {
  constructor(
    private httpService: HttpService, 
    private configService: ConfigService
  ) {}

  async getAccessToken(code: string): Promise<string> {
    try {
      const params = new URLSearchParams();

      const clientId = this.configService.get('CALENDLY_CLIENT_ID');
      const clientSecret = this.configService.get('CALENDLY_CLIENT_SECRET');
      const redirectUrl = this.configService.get('CALENDLY_REDIRECT_URL');

      if (!clientId || !clientSecret || !redirectUrl) {
        throw new HttpException(
          'Missing required environment variables for Calendly OAuth',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      params.append('grant_type', 'authorization_code');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('redirect_uri', redirectUrl);
      params.append('code', code);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://auth.calendly.com/oauth/token',
          params.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }
        )
      );

      if (!response.data.access_token) {
        throw new HttpException(
          'Failed to get access token from Calendly',
          HttpStatus.BAD_REQUEST
        );
      }

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to authenticate with Calendly',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api.calendly.com/users/me',
          {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      return response.data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new HttpException(
        'Failed to get user information from Calendly',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getScheduledEvents(accessToken: string, params?: any) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.count) queryParams.append('count', params.count.toString());
      if (params?.page_token) queryParams.append('page_token', params.page_token);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.min_start_time) queryParams.append('min_start_time', params.min_start_time);
      if (params?.max_start_time) queryParams.append('max_start_time', params.max_start_time);

      const url = `https://api.calendly.com/scheduled_events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      );

      // Procesar y formatear las fechas para mejor visualización
      const events = response.data.collection.map(event => ({
        ...event,
        start_time: new Date(event.start_time).toLocaleString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Mexico_City'
        }),
        end_time: new Date(event.end_time).toLocaleString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Mexico_City'
        }),
        created_at: new Date(event.created_at).toLocaleString('es-ES'),
        updated_at: new Date(event.updated_at).toLocaleString('es-ES')
      }));

      return {
        ...response.data,
        collection: events,
        summary: {
          total_events: events.length,
          upcoming_events: events.filter(e => new Date(e.start_time) > new Date()).length,
          past_events: events.filter(e => new Date(e.start_time) <= new Date()).length
        }
      };
    } catch (error) {
      console.error('Error getting scheduled events:', error);
      throw new HttpException(
        'Failed to get scheduled events from Calendly',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEventTypes(accessToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api.calendly.com/event_types',
          {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      return response.data;
    } catch (error) {
      console.error('Error getting event types:', error);
      throw new HttpException(
        'Failed to get event types from Calendly',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createSchedulingLink(accessToken: string, eventTypeUri: string, maxEventCount: number = 1) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.calendly.com/scheduling_links',
          {
            max_event_count: maxEventCount,
            owner: eventTypeUri
          },
          {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      return response.data;
    } catch (error) {
      console.error('Error creating scheduling link:', error);
      throw new HttpException(
        'Failed to create scheduling link',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getInviteeDetails(accessToken: string, inviteeUri: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          inviteeUri,
          {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      return response.data;
    } catch (error) {
      console.error('Error getting invitee details:', error);
      throw new HttpException(
        'Failed to get invitee details',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUpcomingEvents(accessToken: string, days: number = 30) {
    try {
      const minStartTime = new Date().toISOString();
      const maxStartTime = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      
      return await this.getScheduledEvents(accessToken, {
        min_start_time: minStartTime,
        max_start_time: maxStartTime,
        status: 'active'
      });
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw new HttpException(
        'Failed to get upcoming events',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEventAnalytics(accessToken: string, eventTypeUri: string, startDate: string, endDate: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.calendly.com/event_type_analytics?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${startDate}&end_time=${endDate}`,
          {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      return response.data;
    } catch (error) {
      console.error('Error getting event analytics:', error);
      throw new HttpException(
        'Failed to get event analytics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}



