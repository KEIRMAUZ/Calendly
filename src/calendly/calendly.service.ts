import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Event, EventDocument } from './schemas/event.schema';

@Injectable()
export class CalendlyService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>
  ) {}

  // ===== WEBHOOK SUBSCRIPTIONS =====

  async createWebhookSubscription(accessToken: string, webhookData: any) {
    try {
      console.log('🔗 Creando webhook subscription:', webhookData);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.calendly.com/webhook_subscriptions',
          {
            url: webhookData.url,
            events: webhookData.events, // ['invitee.created', 'invitee.canceled']
            organization: webhookData.organization,
            scope: webhookData.scope // 'organization' or 'user'
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      console.log('✅ Webhook subscription creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando webhook subscription:', error);
      throw new HttpException(
        'Error creando webhook subscription',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getWebhookSubscriptions(accessToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api.calendly.com/webhook_subscriptions',
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
      console.error('❌ Error obteniendo webhook subscriptions:', error);
      throw new HttpException(
        'Error obteniendo webhook subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteWebhookSubscription(accessToken: string, subscriptionUri: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          subscriptionUri,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      console.log('✅ Webhook subscription eliminado');
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando webhook subscription:', error);
      throw new HttpException(
        'Error eliminando webhook subscription',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ===== WEBHOOK PROCESSING =====

  async processWebhook(payload: any) {
    try {
      console.log('📥 Procesando webhook:', payload.event);

      const webhookType = payload.event;
      const eventData = payload.payload;

      switch (webhookType) {
        case 'invitee.created':
          return await this.handleInviteeCreated(eventData);
        
        case 'invitee.canceled':
          return await this.handleInviteeCanceled(eventData);
        
        case 'routing_form_submission.created':
          return await this.handleRoutingFormSubmission(eventData);
        
        default:
          console.log('⚠️ Webhook type no manejado:', webhookType);
          return { processed: false, reason: 'Unsupported webhook type' };
      }
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      throw new HttpException(
        'Error procesando webhook',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async handleInviteeCreated(eventData: any) {
    try {
      console.log('🎉 Procesando evento creado:', eventData.uri);

      // Extraer información del evento
      const eventInfo = {
        calendlyEventId: eventData.uri.split('/').pop(),
        eventType: eventData.event_type?.name || 'Evento',
        startTime: new Date(eventData.start_time),
        endTime: new Date(eventData.end_time),
        inviteeEmail: eventData.invitee?.email || 'sin-email@example.com',
        inviteeName: eventData.invitee?.name || 'Invitado',
        inviteePhone: eventData.invitee?.phone,
        organizerEmail: eventData.organizer?.email || 'organizador@example.com',
        organizerName: eventData.organizer?.name || 'Organizador',
        location: eventData.location,
        description: eventData.description,
        status: 'active',
        calendlyUri: eventData.uri,
        inviteeUri: eventData.invitee?.uri,
        eventTypeUri: eventData.event_type?.uri,
        calendlyData: eventData,
        inviteeData: eventData.invitee,
        webhookType: 'invitee.created',
        webhookPayload: eventData,
        webhookProcessed: true,
        webhookProcessedAt: new Date()
      };

      // Verificar si el evento ya existe
      const existingEvent = await this.eventModel.findOne({
        calendlyEventId: eventInfo.calendlyEventId
      });

      if (existingEvent) {
        console.log('🔄 Evento ya existe, actualizando...');
        const updatedEvent = await this.eventModel.findByIdAndUpdate(
          existingEvent._id,
          eventInfo,
          { new: true }
        );
        return { processed: true, event: updatedEvent, action: 'updated' };
      }

      // Crear nuevo evento
      const newEvent = new this.eventModel(eventInfo);
      const savedEvent = await newEvent.save();

      console.log('✅ Evento creado desde webhook:', savedEvent._id);
      return { processed: true, event: savedEvent, action: 'created' };
    } catch (error) {
      console.error('❌ Error procesando invitee.created:', error);
      throw error;
    }
  }

  private async handleInviteeCanceled(eventData: any) {
    try {
      console.log('❌ Procesando evento cancelado:', eventData.uri);

      const eventId = eventData.uri.split('/').pop();
      
      // Buscar el evento en la base de datos
      const existingEvent = await this.eventModel.findOne({
        calendlyEventId: eventId
      });

      if (!existingEvent) {
        console.log('⚠️ Evento no encontrado para cancelar:', eventId);
        return { processed: false, reason: 'Event not found' };
      }

      // Actualizar estado del evento
      const updatedEvent = await this.eventModel.findByIdAndUpdate(
        existingEvent._id,
        {
          status: 'canceled',
          cancelReason: eventData.cancel_reason || 'Cancelado por el invitado',
          webhookType: 'invitee.canceled',
          webhookPayload: eventData,
          webhookProcessed: true,
          webhookProcessedAt: new Date()
        },
        { new: true }
      );

      if (updatedEvent) {
        console.log('✅ Evento cancelado desde webhook:', updatedEvent._id);
      } else {
        console.log('❌ No se encontró el evento para cancelar desde webhook');
      }
      return { processed: true, event: updatedEvent, action: 'canceled' };
    } catch (error) {
      console.error('❌ Error procesando invitee.canceled:', error);
      throw error;
    }
  }

  private async handleRoutingFormSubmission(eventData: any) {
    try {
      console.log('📝 Procesando routing form submission:', eventData.uri);

      // Crear un registro especial para routing form submissions
      const routingInfo = {
        calendlyEventId: `routing_${Date.now()}`,
        eventType: 'Routing Form Submission',
        startTime: new Date(),
        endTime: new Date(),
        inviteeEmail: eventData.invitee?.email || 'sin-email@example.com',
        inviteeName: eventData.invitee?.name || 'Usuario',
        status: 'routing_submission',
        calendlyUri: eventData.uri,
        calendlyData: eventData,
        webhookType: 'routing_form_submission.created',
        webhookPayload: eventData,
        webhookProcessed: true,
        webhookProcessedAt: new Date()
      };

      const newRoutingEvent = new this.eventModel(routingInfo);
      const savedRoutingEvent = await newRoutingEvent.save();

      console.log('✅ Routing form submission procesado:', savedRoutingEvent._id);
      return { processed: true, event: savedRoutingEvent, action: 'routing_submission' };
    } catch (error) {
      console.error('❌ Error procesando routing form submission:', error);
      throw error;
    }
  }

  // ===== EVENT MANAGEMENT =====

  async getEventsFromDatabase() {
    try {
      const events = await this.eventModel
        .find()
        .sort({ startTime: -1 })
        .limit(50);

      return events;
    } catch (error) {
      console.error('❌ Error obteniendo eventos:', error);
      throw new HttpException(
        'Error obteniendo eventos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEventById(eventId: string) {
    try {
      const event = await this.eventModel.findById(eventId);
      if (!event) {
        throw new HttpException(
          'Evento no encontrado',
          HttpStatus.NOT_FOUND
        );
      }
      return event;
    } catch (error) {
      console.error('❌ Error obteniendo evento:', error);
      throw new HttpException(
        'Error obteniendo evento',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEventStats() {
    try {
      const totalEvents = await this.eventModel.countDocuments();
      const activeEvents = await this.eventModel.countDocuments({ status: 'active' });
      const canceledEvents = await this.eventModel.countDocuments({ status: 'canceled' });
      const webhookProcessed = await this.eventModel.countDocuments({ webhookProcessed: true });

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const eventsThisMonth = await this.eventModel.countDocuments({
        startTime: { $gte: thisMonth }
      });

      const eventsThisWeek = await this.eventModel.countDocuments({
        startTime: { $gte: thisWeek }
      });

      return {
        totalEvents,
        activeEvents,
        canceledEvents,
        webhookProcessed,
        eventsThisMonth,
        eventsThisWeek
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw new HttpException(
        'Error obteniendo estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ===== CALENDLY API INTEGRATION =====

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
      const userInfo = await this.getUserInfo(accessToken);
      const userUri = userInfo.resource?.uri;
      
      if (!userUri) {
        throw new Error('No se pudo obtener el URI del usuario de Calendly');
      }

      const baseUrl = 'https://api.calendly.com/scheduled_events';
      const queryParams = new URLSearchParams();
      queryParams.append('user', userUri);
      
      if (params?.count) {
        queryParams.append('count', params.count.toString());
      }
      if (params?.page_token) {
        queryParams.append('page_token', params.page_token);
      }
      if (params?.status) {
        queryParams.append('status', params.status);
      }

      const url = `${baseUrl}?${queryParams.toString()}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      );

      return response.data;
    } catch (error) {
      console.error('Error getting scheduled events:', error);
      throw new HttpException(
        'Failed to get scheduled events',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ===== MANUAL EVENT CREATION =====

  async createEvent(eventData: any) {
    try {
      console.log('📝 Creando evento manualmente:', eventData);

      const newEvent = new this.eventModel({
        calendlyEventId: `manual_${Date.now()}`,
        eventType: eventData.eventType || 'Evento Manual',
        startTime: new Date(eventData.startTime),
        endTime: new Date(eventData.endTime),
        inviteeEmail: eventData.inviteeEmail,
        inviteeName: eventData.inviteeName,
        status: eventData.status || 'active',
        calendlyUri: eventData.calendlyUri || `manual://${Date.now()}`,
        calendlyData: eventData.calendlyData || {},
        webhookType: 'manual_creation',
        webhookPayload: eventData,
        webhookProcessed: true,
        webhookProcessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedEvent = await newEvent.save();
      console.log('✅ Evento creado manualmente:', savedEvent._id);

      return savedEvent;
    } catch (error) {
      console.error('❌ Error creando evento manualmente:', error);
      throw new HttpException(
        'Error creando evento',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 