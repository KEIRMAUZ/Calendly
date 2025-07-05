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
  ) {
    // No crear eventos de demostración - solo eventos reales
    console.log('🚀 CalendlyService inicializado - Modo integración real');
  }

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
      // Obtener eventos reales de Calendly
      let realEvents = [];
      
      try {
        // Primero obtener información del usuario para usar en las peticiones
        console.log('🔍 Obteniendo información del usuario de Calendly...');
        
        const userInfoResponse = await firstValueFrom(
          this.httpService.get('https://api.calendly.com/users/me', {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          })
        );

        const userInfo = userInfoResponse.data;
        console.log('✅ Información del usuario obtenida:', userInfo);
        
        // Construir URL con el URI del usuario
        const userUri = userInfo.resource?.uri;
        console.log('🔍 User URI extraído:', userUri);
        
        if (!userUri) {
          throw new Error('No se pudo obtener el URI del usuario de Calendly');
        }
        const baseUrl = 'https://api.calendly.com/scheduled_events';
        
        // Agregar parámetros de consulta
        const queryParams = new URLSearchParams();
        queryParams.append('user', userUri);
        
        // Agregar parámetros adicionales si se proporcionan
        if (params?.count && params.count > 0 && params.count <= 100) {
          queryParams.append('count', params.count.toString());
        }
        if (params?.page_token) {
          queryParams.append('page_token', params.page_token);
        }
        if (params?.status && ['active', 'canceled'].includes(params.status)) {
          queryParams.append('status', params.status);
        }
        if (params?.min_start_time) {
          queryParams.append('min_start_time', params.min_start_time);
        }
        if (params?.max_start_time) {
          queryParams.append('max_start_time', params.max_start_time);
        }

        const url = `${baseUrl}?${queryParams.toString()}`;
        console.log('🔍 URL de petición a Calendly:', url);
        
        const response = await firstValueFrom(
          this.httpService.get(url, {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          })
        );

        realEvents = response.data.collection || [];
        console.log(`✅ Eventos reales obtenidos: ${realEvents.length} eventos`);
      } catch (error) {
        console.error('❌ Error obteniendo eventos reales de Calendly:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          details: error.response?.data?.details
        });
        
        // Log detallado de los detalles del error
        if (error.response?.data?.details) {
          console.error('🔍 Detalles del error de Calendly:');
          error.response.data.details.forEach((detail, index) => {
            console.error(`  ${index + 1}. ${JSON.stringify(detail)}`);
          });
        }
        console.log('🔄 Usando solo eventos de prueba');
        realEvents = [];
      }

      // Obtener eventos de prueba
      const testEvents = this.testEvents.map((event: any) => ({
        ...event,
        // Asegurar que las fechas estén en formato ISO
        start_time: event.start_time,
        end_time: event.end_time,
        created_at: event.created_at,
        updated_at: event.updated_at,
        // Marcar como evento de prueba
        is_test_event: true
      }));

      console.log(`📊 Eventos de prueba: ${testEvents.length} eventos`);

      // Combinar eventos reales y de prueba
      const allEvents = [...realEvents, ...testEvents];
      
      // Ordenar por fecha de inicio (más recientes primero)
      allEvents.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

      console.log(`📊 Total de eventos combinados: ${allEvents.length} eventos`);

      return {
        collection: allEvents,
        summary: {
          total_events: allEvents.length,
          upcoming_events: allEvents.filter(e => new Date(e.start_time) > new Date()).length,
          past_events: allEvents.filter(e => new Date(e.start_time) <= new Date()).length,
          real_events: realEvents.length,
          test_events: testEvents.length
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
      // First, get the user information to get the user URI
      const userInfo = await this.getUserInfo(accessToken);
      console.log('User info for event types:', userInfo);
      
      if (!userInfo.resource?.uri) {
        throw new HttpException(
          'No se pudo obtener la información del usuario',
          HttpStatus.BAD_REQUEST
        );
      }

      // Extract the user URI
      const userUri = userInfo.resource.uri;
      console.log('Using user URI for event types:', userUri);

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}`,
          {
            headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      console.log('Event types response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting event types:', error);
      if (error.response) {
        console.error('Calendly API error details:', error.response.data);
      }
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
      console.log('🔍 Creando evento personalizado con datos:', eventData);
      
      // Validar datos requeridos
      if (!eventData.title || !eventData.startDate) {
        throw new HttpException(
          'Título y fecha de inicio son requeridos',
          HttpStatus.BAD_REQUEST
        );
      }

      // Crear un evento personalizado en memoria
      const newEvent = {
        id: `custom_event_${Date.now()}`,
        uri: `https://api.calendly.com/scheduled_events/custom_event_${Date.now()}`,
        name: eventData.title,
        description: eventData.description || '',
        start_time: eventData.startDate,
        end_time: eventData.endDate || new Date(new Date(eventData.startDate).getTime() + 60 * 60 * 1000).toISOString(),
        location: eventData.location || 'Sin ubicación',
        attendees: eventData.attendees || [],
        event_type: 'Evento Personalizado',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        invitee: {
          email: eventData.attendees?.[0] || 'usuario@example.com',
          name: eventData.attendees?.[0]?.split('@')[0] || 'Usuario',
          timezone: eventData.timezone || 'America/Mexico_City'
        },
        // Datos adicionales para eventos personalizados
        customData: {
          duration: eventData.duration || 60,
          maxAttendees: eventData.maxAttendees || 1,
          isCustomEvent: true,
          ...eventData
        },
        // Marcar como evento personalizado
        is_custom_event: true
      };

      // Guardar en memoria
      this.testEvents.push(newEvent);

      console.log('✅ Evento personalizado creado exitosamente:', {
        id: newEvent.id,
        name: newEvent.name,
        start_time: newEvent.start_time,
        attendees: newEvent.attendees.length
      });

      return {
        message: 'Evento personalizado creado exitosamente',
        data: newEvent
      };
    } catch (error) {
      console.error('❌ Error creating custom event:', error);
      throw new HttpException(
        error.message || 'Failed to create custom event',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteEvent(accessToken: string, eventUri: string) {
    try {
      console.log('🔍 Intentando eliminar evento:', eventUri);
      
      // Buscar y eliminar eventos de prueba/personalizados
      const testEventIndex = this.testEvents.findIndex(event => 
        event.uri === eventUri || event.id === eventUri
      );
      
      if (testEventIndex !== -1) {
        const deletedEvent = this.testEvents.splice(testEventIndex, 1)[0];
        console.log('✅ Evento personalizado eliminado:', {
          id: deletedEvent.id,
          name: deletedEvent.name
        });
        
        return {
          message: 'Evento personalizado eliminado exitosamente',
          data: deletedEvent
        };
      }

      // Si no es un evento personalizado, intentar cancelar en Calendly
      try {
        console.log('🔄 Intentando cancelar evento en Calendly...');
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

        console.log('✅ Evento de Calendly cancelado exitosamente');
        return {
          message: 'Evento de Calendly cancelado exitosamente',
          data: response.data
        };
      } catch (calendlyError) {
        console.error('❌ Error cancelando evento en Calendly:', calendlyError);
        throw new HttpException(
          'No se pudo eliminar el evento de Calendly',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      throw new HttpException(
        error.message || 'Failed to delete event',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
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



