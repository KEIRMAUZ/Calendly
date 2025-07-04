import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CalendlyService {
  // Almacenamiento temporal en memoria para eventos de prueba
  private testEvents: any[] = [];

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
      // Combinar eventos reales de Calendly con eventos de prueba
      let realEvents = [];
      
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

        realEvents = response.data.collection || [];
      } catch (error) {
        console.log('No se pudieron obtener eventos reales de Calendly, usando solo eventos de prueba');
      }

      // Combinar eventos reales con eventos de prueba
      const allEvents = [...realEvents, ...this.testEvents];

      // Mantener las fechas como ISO strings para que el frontend las formatee
      const events = allEvents.map(event => ({
        ...event,
        // Las fechas se mantienen como ISO strings para formateo en el frontend
        start_time: event.start_time,
        end_time: event.end_time,
        created_at: event.created_at,
        updated_at: event.updated_at
      }));

      return {
        collection: events,
        summary: {
          total_events: events.length,
          upcoming_events: events.filter(e => new Date(e.start_time) > new Date()).length,
          past_events: events.filter(e => new Date(e.start_time) <= new Date()).length,
          test_events: this.testEvents.length,
          real_events: realEvents.length
        }
      };
    } catch (error) {
      console.error('Error getting scheduled events:', error);
      throw new HttpException(
        'Failed to get scheduled events',
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

  async createCustomEvent(accessToken: string, eventData: any) {
    try {
      // Crear un evento de prueba en memoria
      const newEvent = {
        id: `test_event_${Date.now()}`,
        uri: `https://api.calendly.com/scheduled_events/test_event_${Date.now()}`,
        name: eventData.title,
        description: eventData.description,
        start_time: eventData.startDate,
        end_time: eventData.endDate,
        location: eventData.location,
        attendees: eventData.attendees || [],
        event_type: eventData.isCustomEvent ? 'Evento Personalizado' : 'Evento de Calendly',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        invitee: {
          email: eventData.attendees?.[0] || 'test@example.com',
          name: eventData.attendees?.[0] || 'Invitado de Prueba',
          timezone: eventData.timezone || 'America/Mexico_City'
        },
        customData: eventData
      };

      // Guardar en memoria
      this.testEvents.push(newEvent);

      console.log('Evento de prueba creado:', newEvent);

      return {
        message: 'Evento personalizado creado exitosamente',
        data: newEvent
      };
    } catch (error) {
      console.error('Error creating custom event:', error);
      throw new HttpException(
        'Failed to create custom event',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteEvent(accessToken: string, eventUri: string) {
    try {
      // Buscar y eliminar eventos de prueba
      const testEventIndex = this.testEvents.findIndex(event => event.uri === eventUri);
      
      if (testEventIndex !== -1) {
        const deletedEvent = this.testEvents.splice(testEventIndex, 1)[0];
        console.log('Evento de prueba eliminado:', deletedEvent);
        
        return {
          message: 'Evento de prueba eliminado exitosamente',
          data: deletedEvent
        };
      }

      // Si no es un evento de prueba, intentar cancelar en Calendly
      try {
        const response = await firstValueFrom(
          this.httpService.post(
            `https://api.calendly.com/scheduled_events/${eventUri}/cancellation`,
            {
              reason: 'Evento cancelado por el organizador'
            },
            {
              headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          )
        );

        return {
          message: 'Evento cancelado exitosamente',
          data: response.data
        };
      } catch (calendlyError) {
        console.error('Error cancelando evento en Calendly:', calendlyError);
        throw new HttpException(
          'No se pudo eliminar el evento',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new HttpException(
        'Failed to delete event',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Método para crear eventos de prueba simples
  async createTestEvent(eventData: any) {
    try {
      const newEvent = {
        id: `test_event_${Date.now()}`,
        uri: `https://api.calendly.com/scheduled_events/test_event_${Date.now()}`,
        name: eventData.title || 'Evento de Prueba',
        description: eventData.description || 'Descripción de prueba',
        start_time: eventData.startDate || new Date().toISOString(),
        end_time: eventData.endDate || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        location: eventData.location || 'Ubicación de prueba',
        attendees: eventData.attendees || ['test@example.com'],
        event_type: 'Evento de Prueba',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        invitee: {
          email: eventData.attendees?.[0] || 'test@example.com',
          name: 'Invitado de Prueba',
          timezone: 'America/Mexico_City'
        }
      };

      // Guardar en memoria
      this.testEvents.push(newEvent);

      console.log('Evento de prueba creado:', newEvent);

      return {
        message: 'Evento de prueba creado exitosamente',
        data: newEvent
      };
    } catch (error) {
      console.error('Error creating test event:', error);
      throw new HttpException(
        'Failed to create test event',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Método para obtener solo eventos de prueba
  getTestEvents() {
    return this.testEvents;
  }

  // Método para limpiar eventos de prueba
  clearTestEvents() {
    this.testEvents = [];
    return { message: 'Eventos de prueba eliminados' };
  }
}



