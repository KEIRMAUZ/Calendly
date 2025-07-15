import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { 
  CalendlyEventTypesResponse, 
  CalendlyAvailableTimesResponse, 
  CalendlySchedulingLinkResponse 
} from './dto/calendly-response.dto';

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

  async deleteWebhookSubscriptionById(accessToken: string, webhookUuid: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `https://api.calendly.com/webhook_subscriptions/${webhookUuid}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      console.log('✅ Webhook subscription eliminado por UUID:', webhookUuid);
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando webhook subscription por UUID:', error);
      
      // Log detallado del error
      if (error.response?.data) {
        console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw new HttpException(
        `Error eliminando webhook subscription: ${error.response?.data?.message || error.message}`,
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

  // ===== PROGRAMMATIC EVENT CREATION =====

  async createProgrammaticEvent(eventData: CreateEventDto, userEmail: string) {
    try {
      console.log('🎯 Creando evento programático:', { eventData, userEmail });

      // Obtener el token de acceso de Calendly
      const accessToken = this.configService.get('CALENDLY_ACCESS_TOKEN');
      if (!accessToken) {
        throw new HttpException(
          'Token de acceso de Calendly no configurado',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // 1. Obtener los tipos de eventos disponibles
      let eventTypes = await this.getEventTypes(accessToken);
      
      // Si no hay tipos de eventos, crear uno por defecto
      if (!eventTypes || eventTypes.length === 0) {
        console.log('📝 No se encontraron tipos de eventos, creando uno por defecto...');
        const defaultEventType = await this.createDefaultEventType(accessToken, userEmail);
        eventTypes = [defaultEventType];
      }

      // Seleccionar el mejor tipo de evento disponible
      // Priorizar eventos activos, de tipo estándar y con duración razonable
      const selectedEventType = this.selectBestEventType(eventTypes);
      console.log('📅 Tipo de evento seleccionado:', selectedEventType.name);

      // 2. Verificar disponibilidad de horarios (opcional para eventos recién creados)
      let availableTimes: any[] = [];
      try {
        availableTimes = await this.getAvailableTimes(
          accessToken,
          selectedEventType.uri,
          eventData.start_time,
          eventData.end_time
        );
        
        if (!availableTimes || availableTimes.length === 0) {
          console.log('⚠️ No hay horarios disponibles, pero continuando con la creación del link...');
        }
      } catch (error) {
        console.log('⚠️ Error verificando disponibilidad, pero continuando con la creación del link...');
        // Continuar sin verificar disponibilidad para eventos recién creados
      }

      // 3. Crear link de agendado single-use
      const schedulingLink = await this.createSchedulingLink(
        accessToken,
        selectedEventType.uri
      );

      // 4. Guardar información del evento en la base de datos
      const eventInfo = {
        calendlyEventId: `programmatic_${Date.now()}`,
        eventType: selectedEventType.name,
        startTime: new Date(eventData.start_time),
        endTime: new Date(eventData.end_time),
        inviteeEmail: eventData.email || userEmail,
        inviteeName: eventData.name,
        inviteePhone: eventData.phone,
        organizerEmail: userEmail,
        organizerName: 'Organizador',
        location: 'Virtual',
        description: eventData.notes || 'Evento creado programáticamente',
        status: 'pending',
        calendlyUri: selectedEventType.uri,
        eventTypeUri: selectedEventType.uri,
        schedulingLink: schedulingLink.booking_url,
        country: eventData.country,
        calendlyData: {
          eventType: selectedEventType,
          availableTimes: availableTimes,
          schedulingLink: schedulingLink
        },
        webhookType: 'programmatic.created',
        webhookProcessed: true,
        webhookProcessedAt: new Date()
      };

      const savedEvent = await this.createEvent(eventInfo);

      console.log('✅ Evento programático creado exitosamente');
      
      return {
        success: true,
        event: savedEvent,
        schedulingLink: schedulingLink.booking_url,
        message: 'Evento creado exitosamente. Use el link para agendar la cita.'
      };

    } catch (error) {
      console.error('❌ Error creando evento programático:', error);
      throw new HttpException(
        error.message || 'Error creando evento programático',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async getEventTypes(accessToken: string): Promise<any[]> {
    try {
      // Primero necesitamos obtener la información del usuario para obtener su URI
      const userInfo = await this.getUserInfo(accessToken);
      const userUri = userInfo.resource?.uri;
      
      if (!userUri) {
        throw new HttpException(
          'No se pudo obtener el URI del usuario de Calendly',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      console.log('👤 URI del usuario de Calendly:', userUri);

      const response = await firstValueFrom(
        this.httpService.get<CalendlyEventTypesResponse>(
          'https://api.calendly.com/event_types',
          {
            params: {
              user: userUri,
              active: true, // Solo eventos activos
              count: 100 // Máximo número de eventos
            },
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      console.log('📅 Tipos de eventos obtenidos:', response.data.collection?.length || 0);
      return response.data.collection || [];
    } catch (error) {
      console.error('❌ Error obteniendo tipos de eventos:', error);
      throw new HttpException(
        'Error obteniendo tipos de eventos de Calendly',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async getAvailableTimes(
    accessToken: string,
    eventTypeUri: string,
    startTime: string,
    endTime: string
  ): Promise<any[]> {
    try {
      // Convertir fechas a formato ISO completo si no lo están
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error('Formato de fecha inválido');
        }
        return date.toISOString();
      };

      const formattedStartTime = formatDate(startTime);
      const formattedEndTime = formatDate(endTime);

      // Verificar que el rango no sea mayor a 7 días
      const startDate = new Date(formattedStartTime);
      const endDate = new Date(formattedEndTime);
      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        console.log('⚠️ Rango de fechas mayor a 7 días, ajustando...');
        // Ajustar a 7 días desde la fecha de inicio
        const adjustedEndDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        endTime = adjustedEndDate.toISOString();
      }

      console.log('📅 Consultando disponibilidad:', {
        event_type: eventTypeUri,
        start_time: formattedStartTime,
        end_time: endTime
      });

      const response = await firstValueFrom(
        this.httpService.get<CalendlyAvailableTimesResponse>(
          'https://api.calendly.com/event_type_available_times',
          {
            params: {
              event_type: eventTypeUri,
              start_time: formattedStartTime,
              end_time: endTime
            },
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      console.log('✅ Horarios disponibles obtenidos:', response.data.collection?.length || 0);
      return response.data.collection || [];
    } catch (error) {
      console.error('❌ Error obteniendo horarios disponibles:', error);
      
      // Log detallado del error
      if (error.response?.data) {
        console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw new HttpException(
        'Error obteniendo horarios disponibles de Calendly',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async createSchedulingLink(
    accessToken: string,
    eventTypeUri: string
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<CalendlySchedulingLinkResponse>(
          'https://api.calendly.com/scheduling_links',
          {
            max_event_count: 1,
            owner: eventTypeUri,
            owner_type: 'EventType'
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      return response.data.resource;
    } catch (error) {
      console.error('❌ Error creando link de agendado:', error);
      throw new HttpException(
        'Error creando link de agendado en Calendly',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private selectBestEventType(eventTypes: any[]): any {
    if (!eventTypes || eventTypes.length === 0) {
      throw new HttpException(
        'No hay tipos de eventos disponibles',
        HttpStatus.NOT_FOUND
      );
    }

    // Filtrar eventos activos y de tipo estándar
    const validEventTypes = eventTypes.filter(event => 
      event.active && 
      event.type === 'StandardEventType' &&
      event.kind === 'solo' // Preferir eventos one-on-one (1 host, 1 invitado)
    );

    if (validEventTypes.length === 0) {
      // Si no hay eventos estándar, usar cualquier evento activo
      const activeEvents = eventTypes.filter(event => event.active);
      if (activeEvents.length === 0) {
        // Si no hay eventos activos, usar el primero disponible
        return eventTypes[0];
      }
      return activeEvents[0];
    }

    // Priorizar eventos con duración entre 15 y 60 minutos
    const preferredEvents = validEventTypes.filter(event => 
      event.duration >= 15 && event.duration <= 60
    );

    if (preferredEvents.length > 0) {
      // Ordenar por duración (preferir eventos más cortos)
      preferredEvents.sort((a, b) => a.duration - b.duration);
      return preferredEvents[0];
    }

    // Si no hay eventos preferidos, usar el primer evento válido
    return validEventTypes[0];
  }

  private async createDefaultEventType(accessToken: string, userEmail: string): Promise<any> {
    try {
      console.log('🔧 Creando tipo de evento por defecto...');

      // Obtener información del usuario para el owner
      const userInfo = await this.getUserInfo(accessToken);
      const userUri = userInfo.resource?.uri;

      if (!userUri) {
        throw new HttpException(
          'No se pudo obtener el URI del usuario de Calendly',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const defaultEventTypeData = {
        owner: userUri,
        name: 'Consulta One-on-One',
        description: 'Consulta individual de 30 minutos',
        duration: 30,
        // Configuración para evento one-on-one (1 host, 1 invitado)
        kind: 'solo', // Indica que es un evento individual
        type: 'StandardEventType', // Tipo estándar
        active: true, // Activo por defecto
        color: '#3B82F6' // Color azul
      };

      console.log('📤 Datos enviados para crear evento:', JSON.stringify(defaultEventTypeData, null, 2));

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.calendly.com/event_types',
          defaultEventTypeData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      console.log('✅ Tipo de evento por defecto creado:', response.data.resource.name);
      return response.data.resource;
    } catch (error) {
      console.error('❌ Error creando tipo de evento por defecto:', error);
      
      // Log detallado del error
      if (error.response?.data) {
        console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
      }
      
      if (error.response?.status) {
        console.error('📊 Status code:', error.response.status);
      }
      
      throw new HttpException(
        `Error creando tipo de evento por defecto: ${error.response?.data?.message || error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 