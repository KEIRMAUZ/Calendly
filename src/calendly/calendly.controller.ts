import { Controller, Get, Post, Delete, Body, Param, Query, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { CalendlyService } from './calendly.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('calendly')
export class CalendlyController {
  constructor(
    private readonly calendlyService: CalendlyService,
    private readonly configService: ConfigService
  ) {}

  // ===== WEBHOOK ENDPOINTS =====

  @Post('webhook')
  async handleWebhook(@Body() payload: any, @Req() req: Request, @Res() res: Response) {
    try {
      console.log('📥 Webhook recibido:', {
        event: payload.event,
        timestamp: new Date().toISOString(),
        headers: req.headers
      });

      // Procesar el webhook
      const result = await this.calendlyService.processWebhook(payload);

      // Responder con éxito
      res.status(HttpStatus.OK).json({
        success: true,
        processed: result.processed,
        action: result.action || 'processed'
      });
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Error procesando webhook'
      });
    }
  }

  // ===== WEBHOOK SUBSCRIPTION MANAGEMENT =====

  @Post('webhook-subscriptions')
  async createWebhookSubscription(@Body() webhookData: any, @Query('token') accessToken: string) {
    try {
      if (!accessToken) {
        throw new Error('Access token requerido');
      }

      const result = await this.calendlyService.createWebhookSubscription(accessToken, webhookData);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Error creando webhook subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('webhook-subscriptions')
  async getWebhookSubscriptions(@Query('token') accessToken: string) {
    try {
      if (!accessToken) {
        throw new Error('Access token requerido');
      }

      const result = await this.calendlyService.getWebhookSubscriptions(accessToken);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Error obteniendo webhook subscriptions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('webhook-subscriptions/:subscriptionUri/delete')
  async deleteWebhookSubscription(
    @Param('subscriptionUri') subscriptionUri: string,
    @Query('token') accessToken: string
  ) {
    try {
      if (!accessToken) {
        throw new Error('Access token requerido');
      }

      const result = await this.calendlyService.deleteWebhookSubscription(accessToken, subscriptionUri);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Error eliminando webhook subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Delete('webhook-subscriptions/:webhookUuid')
  async deleteWebhookSubscriptionById(
    @Param('webhookUuid') webhookUuid: string,
    @Query('token') accessToken: string
  ) {
    try {
      if (!accessToken) {
        throw new Error('Access token requerido');
      }

      console.log('🗑️ Eliminando webhook subscription por UUID:', webhookUuid);

      const result = await this.calendlyService.deleteWebhookSubscriptionById(accessToken, webhookUuid);
      return {
        success: true,
        data: result,
        message: 'Webhook subscription eliminado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error eliminando webhook subscription por UUID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== EVENT MANAGEMENT =====

  @Get('events')
  async getEvents() {
    try {
      const events = await this.calendlyService.getEventsFromDatabase();
      return {
        success: true,
        data: events,
        count: events.length
      };
    } catch (error) {
      console.error('❌ Error obteniendo eventos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('events/:eventId')
  async getEventById(@Param('eventId') eventId: string) {
    try {
      const event = await this.calendlyService.getEventById(eventId);
      return {
        success: true,
        data: event
      };
    } catch (error) {
      console.error('❌ Error obteniendo evento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('events')
  async createEvent(@Body() eventData: any) {
    try {
      const event = await this.calendlyService.createEvent(eventData);
      return {
        success: true,
        data: event,
        message: 'Evento creado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('stats')
  async getEventStats() {
    try {
      const stats = await this.calendlyService.getEventStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== CALENDLY API INTEGRATION =====

  @Get('connect')
  async connectToCalendly(@Query('code') code: string) {
    try {
      if (!code) {
        return {
          success: false,
          error: 'Código de autorización requerido'
        };
      }

      const accessToken = await this.calendlyService.getAccessToken(code);
      const userInfo = await this.calendlyService.getUserInfo(accessToken);

      return {
        success: true,
        data: {
          accessToken,
          userInfo
        }
      };
    } catch (error) {
      console.error('❌ Error conectando con Calendly:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('user-info')
  async getUserInfo(@Query('token') accessToken: string) {
    try {
      if (!accessToken) {
        throw new Error('Access token requerido');
      }

      const userInfo = await this.calendlyService.getUserInfo(accessToken);
      return {
        success: true,
        data: userInfo
      };
    } catch (error) {
      console.error('❌ Error obteniendo información del usuario:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('scheduled-events')
  async getScheduledEvents(
    @Query('token') accessToken: string,
    @Query('count') count?: string,
    @Query('status') status?: string
  ) {
    try {
      if (!accessToken) {
        throw new Error('Access token requerido');
      }

      const params: any = {};
      if (count) params.count = parseInt(count);
      if (status) params.status = status;

      const events = await this.calendlyService.getScheduledEvents(accessToken, params);
      return {
        success: true,
        data: events
      };
    } catch (error) {
      console.error('❌ Error obteniendo eventos programados:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== TEST ENDPOINTS =====

  @Get('ping')
  async ping() {
    return {
      success: true,
      message: 'Calendly service is running',
      timestamp: new Date().toISOString()
    };
  }

  @Get('access-token')
  async getAccessToken() {
    try {
      const accessToken = this.configService.get('CALENDLY_ACCESS_TOKEN');
      if (!accessToken) {
        return {
          success: false,
          error: 'CALENDLY_ACCESS_TOKEN no configurado en el backend'
        };
      }
      return {
        success: true,
        data: { accessToken }
      };
    } catch (error) {
      console.error('❌ Error obteniendo access token:', error);
      return {
        success: false,
        error: 'Error obteniendo access token'
      };
    }
  }

  @Get('test-webhook')
  async testWebhook() {
    try {
      // Simular un webhook de prueba
      const testPayload = {
        event: 'invitee.created',
        payload: {
          uri: 'https://api.calendly.com/scheduled_events/test_event_123',
          event_type: {
            name: 'Test Event Type',
            uri: 'https://api.calendly.com/event_types/test_type_123'
          },
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          invitee: {
            email: 'test@example.com',
            name: 'Test User',
            uri: 'https://api.calendly.com/scheduled_events/test_event_123/invitees/test_invitee_123'
          },
          organizer: {
            email: 'organizer@example.com',
            name: 'Test Organizer'
          },
          location: 'Test Location',
          description: 'Test event description'
        }
      };

      const result = await this.calendlyService.processWebhook(testPayload);
      return {
        success: true,
        message: 'Test webhook processed successfully',
        result
      };
    } catch (error) {
      console.error('❌ Error procesando test webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== PROGRAMMATIC EVENT CREATION =====

  @Post('create-event')
  @UseGuards(AuthGuard('jwt'))
  async createProgrammaticEvent(@Body() eventData: CreateEventDto, @Req() req: Request) {
    try {
      console.log('🎯 Endpoint create-event llamado:', eventData);
      
      // Obtener el email del usuario autenticado
      const userEmail = (req.user as any)?.email;
      if (!userEmail) {
        return {
          success: false,
          error: 'Usuario no autenticado o email no disponible'
        };
      }

      console.log('👤 Usuario autenticado:', userEmail);

      const result = await this.calendlyService.createProgrammaticEvent(eventData, userEmail);
      
      return {
        success: true,
        data: result,
        message: 'Evento creado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error creando evento programático:', error);
      return {
        success: false,
        error: error.message || 'Error interno del servidor'
      };
    }
  }
} 