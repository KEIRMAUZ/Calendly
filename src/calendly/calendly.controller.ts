import { Controller, Res, Post, Body, Headers, Query, Get, UseGuards, UnauthorizedException, Request, Param, Delete } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CalendlyService } from './calendly.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('calendly')
export class CalendlyController {
  constructor(
    private configService: ConfigService, 
    private calendlyService: CalendlyService
  ) {}

  // Endpoint de prueba sin autenticación
  @Get('ping')
  async ping() {
    return {
      message: 'Backend funcionando correctamente',
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        service: 'Calendly API',
        version: '1.0.0',
        uptime: process.uptime()
      }
    };
  }

  // Endpoint de prueba para verificar autenticación
  @Get('test-auth')
  @UseGuards(AuthGuard('jwt'))
  async testAuth(@Request() req: any) {
    return {
      message: 'Autenticación JWT funcionando correctamente',
      status: 'success',
      timestamp: new Date().toISOString(),
      user: req.user,
      data: {
        authenticated: true,
        userInfo: {
          email: req.user.email,
          name: `${req.user.firstName} ${req.user.lastName}`,
          googleId: req.user.sub
        }
      }
    };
  }

  // Endpoint de diagnóstico para verificar cookies y JWT
  @Get('debug-auth')
  async debugAuth(@Request() req: any, @Headers() headers: any) {
    const cookies = req.cookies || {};
    const authHeader = headers.authorization;
    
    return {
      message: 'Información de diagnóstico de autenticación',
      status: 'debug',
      timestamp: new Date().toISOString(),
      data: {
        cookies: {
          jwt_token: cookies.jwt_token ? 'Presente' : 'Ausente',
          all_cookies: Object.keys(cookies)
        },
        headers: {
          authorization: authHeader ? 'Presente' : 'Ausente',
          user_agent: headers['user-agent']?.substring(0, 50) + '...'
        },
        request: {
          method: req.method,
          url: req.url,
          ip: req.ip
        }
      }
    };
  }

  // Endpoint para verificar configuración de Calendly
  @Get('config-status')
  @UseGuards(AuthGuard('jwt'))
  async getConfigStatus(@Request() req: any) {
    const calendlyAccessToken = this.configService.get('CALENDLY_ACCESS_TOKEN');
    const calendlyClientId = this.configService.get('CALENDLY_CLIENT_ID');
    const calendlyClientSecret = this.configService.get('CALENDLY_CLIENT_SECRET');
    
    return {
      message: 'Estado de configuración de Calendly',
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        calendly: {
          access_token: calendlyAccessToken ? 'Configurado' : 'No configurado',
          client_id: calendlyClientId ? 'Configurado' : 'No configurado',
          client_secret: calendlyClientSecret ? 'Configurado' : 'No configurado',
          can_connect: !!(calendlyAccessToken && calendlyClientId && calendlyClientSecret)
        },
        user: {
          email: req.user?.email,
          name: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'No disponible'
        },
        test_events: this.calendlyService.getTestEvents().length
      }
    };
  }

  // Endpoint para obtener eventos reales de Calendly
  @Get('events')
  @UseGuards(AuthGuard('jwt'))
  async getEvents(@Request() req: any) {
    console.log('🔍 DEBUG: getEvents endpoint called');
    console.log('👤 Request user:', req.user);
    
    try {
      // Obtener el token de acceso de Calendly desde el usuario autenticado
      // Por ahora, usaremos un token de acceso hardcodeado para pruebas
      // En producción, esto debería venir de la base de datos del usuario
      const calendlyAccessToken = this.configService.get('CALENDLY_ACCESS_TOKEN');
      
      console.log('🔑 Calendly Access Token present:', !!calendlyAccessToken);
      
      if (!calendlyAccessToken) {
        console.log('⚠️ No hay token de Calendly configurado');
        return {
          message: 'No hay token de Calendly configurado. Por favor, configura CALENDLY_ACCESS_TOKEN en las variables de entorno.',
          status: 'error',
          timestamp: new Date().toISOString(),
          data: {
            collection: [],
            summary: {
              total_events: 0,
              upcoming_events: 0,
              past_events: 0,
              real_events: 0,
              test_events: 0
            }
          }
        };
      }

      // Obtener eventos programados de Calendly
      const events = await this.calendlyService.getScheduledEvents(calendlyAccessToken, {
        count: 20,
        status: 'active'
      });

      console.log('✅ Events retrieved successfully:', events.collection?.length || 0, 'events');

      return {
        message: 'Eventos de Calendly obtenidos exitosamente',
        status: 'success',
        timestamp: new Date().toISOString(),
        data: events
      };
    } catch (error) {
      console.error('❌ Error obteniendo eventos de Calendly:', error);
      return {
        message: 'Error al obtener eventos de Calendly',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        data: {
          collection: [],
          summary: {
            total_events: 0,
            upcoming_events: 0,
            past_events: 0
          }
        }
      };
    }
  }

  // Endpoint para obtener estadísticas reales de Calendly
  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Request() req: any) {
    try {
      const calendlyAccessToken = this.configService.get('CALENDLY_ACCESS_TOKEN');
      
      if (!calendlyAccessToken) {
        throw new UnauthorizedException('No se encontró token de acceso de Calendly. Por favor, configure CALENDLY_ACCESS_TOKEN en las variables de entorno.');
      }

      // Obtener eventos para calcular estadísticas
      const events = await this.calendlyService.getScheduledEvents(calendlyAccessToken, {
        count: 100
      });

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const eventsThisMonth = events.collection.filter(event => 
        new Date(event.start_time) >= thisMonth
      ).length;

      const eventsThisWeek = events.collection.filter(event => 
        new Date(event.start_time) >= thisWeek
      ).length;

      const upcomingEvents = events.collection.filter(event => 
        new Date(event.start_time) > now
      ).length;

      const pastEvents = events.collection.filter(event => 
        new Date(event.start_time) <= now
      ).length;

      // Calcular duración promedio
      const durations = events.collection.map(event => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        return (end.getTime() - start.getTime()) / (1000 * 60); // en minutos
      });

      const averageDuration = durations.length > 0 
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

      return {
        message: 'Estadísticas de Calendly obtenidas exitosamente',
        status: 'success',
        timestamp: new Date().toISOString(),
        data: {
          total_events: events.collection.length,
          events_this_month: eventsThisMonth,
          events_this_week: eventsThisWeek,
          upcoming_events: upcomingEvents,
          past_events: pastEvents,
          average_duration: `${averageDuration} minutos`,
          most_popular_time: '10:00 AM', // Esto se calcularía con más datos
          cancellation_rate: '8%' // Esto se calcularía con más datos
        }
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de Calendly:', error);
      return {
        message: 'Error al obtener estadísticas de Calendly',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        data: {
          total_events: 0,
          events_this_month: 0,
          events_this_week: 0,
          upcoming_events: 0,
          past_events: 0,
          average_duration: '0 minutos',
          most_popular_time: 'N/A',
          cancellation_rate: '0%'
        }
      };
    }
  }

  // Endpoint para obtener tipos de eventos
  @Get('event-types')
  @UseGuards(AuthGuard('jwt'))
  async getEventTypes(@Request() req: any) {
    try {
      const calendlyAccessToken = this.configService.get('CALENDLY_ACCESS_TOKEN');
      
      if (!calendlyAccessToken) {
        throw new UnauthorizedException('No se encontró token de acceso de Calendly. Por favor, configure CALENDLY_ACCESS_TOKEN en las variables de entorno.');
      }

      const eventTypes = await this.calendlyService.getEventTypes(calendlyAccessToken);

      return {
        message: 'Tipos de eventos obtenidos exitosamente',
        status: 'success',
        timestamp: new Date().toISOString(),
        data: eventTypes
      };
    } catch (error) {
      console.error('Error obteniendo tipos de eventos:', error);
      return {
        message: 'Error al obtener tipos de eventos',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        data: { collection: [] }
      };
    }
  }

  // Endpoint para crear un evento de prueba
  @Post('events')
  @UseGuards(AuthGuard('jwt'))
  async createEvent(@Request() req: any, @Body() eventData: any) {
    try {
      const calendlyAccessToken = this.configService.get('CALENDLY_ACCESS_TOKEN');
      
      if (!calendlyAccessToken) {
        throw new UnauthorizedException('No se encontró token de acceso de Calendly');
      }

      const result = await this.calendlyService.createTestEvent(eventData);

      return {
        message: 'Evento de prueba creado exitosamente',
        status: 'success',
        timestamp: new Date().toISOString(),
        data: result.data
      };
    } catch (error) {
      console.error('Error creando evento:', error);
      return {
        message: 'Error al crear evento',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  @Post('/webhook')
  handleCalendlyWebhook(@Body() payload: any, @Headers() headers: any) {
    console.log('Webhook recibido de Calendly:', payload);
    
    // Verify webhook signature if needed
    // const signature = headers['calendly-webhook-signature'];
    
    return { status: 'ok' };
  }

  @Get('connect')
  connect(@Res() res: Response) {
    const clientId = this.configService.get('CALENDLY_CLIENT_ID');
    const redirectUrl = this.configService.get('CALENDLY_REDIRECT_URL');
    
    if (!clientId || !redirectUrl) {
      return res.status(500).json({ error: 'Missing Calendly configuration' });
    }
    
    const authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}`;
    res.redirect(authUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    try {
      const accessToken = await this.calendlyService.getAccessToken(code);
      const userInfo = await this.calendlyService.getUserInfo(accessToken);
      
      // Store the access token securely (in session, database, etc.)
      // For now, we'll return it in the response
      return res.json({
        success: true,
        accessToken,
        userInfo,
        message: 'Token de acceso obtenido. Copie el accessToken y configúrelo como CALENDLY_ACCESS_TOKEN en las variables de entorno.'
      });
    } catch (error) {
      console.error('Error in Calendly callback:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  @Get('user-info')
  @UseGuards(AuthGuard('jwt'))
  async getUserInfo(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    const accessToken = authHeader.substring(7);
    return await this.calendlyService.getUserInfo(accessToken);
  }

  @Get('scheduled-events')
  @UseGuards(AuthGuard('jwt'))
  async getScheduledEvents(
    @Headers('authorization') authHeader: string,
    @Query('count') count?: string,
    @Query('page_token') pageToken?: string,
    @Query('status') status?: string,
    @Query('min_start_time') minStartTime?: string,
    @Query('max_start_time') maxStartTime?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    const accessToken = authHeader.substring(7);
    const params: any = {};
    
    if (count) params.count = parseInt(count);
    if (pageToken) params.page_token = pageToken;
    if (status) params.status = status;
    if (minStartTime) params.min_start_time = minStartTime;
    if (maxStartTime) params.max_start_time = maxStartTime;
    
    return await this.calendlyService.getScheduledEvents(accessToken, params);
  }

  @Get('upcoming-events')
  @UseGuards(AuthGuard('jwt'))
  async getUpcomingEvents(
    @Headers('authorization') authHeader: string,
    @Query('days') days?: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    const accessToken = authHeader.substring(7);
    const daysCount = days ? parseInt(days) : 30;
    
    return await this.calendlyService.getUpcomingEvents(accessToken, daysCount);
  }

  @Post('scheduling-links')
  @UseGuards(AuthGuard('jwt'))
  async createSchedulingLink(
    @Headers('authorization') authHeader: string,
    @Body() body: { eventTypeUri: string; maxEventCount?: number }
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    const accessToken = authHeader.substring(7);
    return await this.calendlyService.createSchedulingLink(
      accessToken, 
      body.eventTypeUri, 
      body.maxEventCount || 1
    );
  }

  @Get('invitee-details')
  @UseGuards(AuthGuard('jwt'))
  async getInviteeDetails(
    @Headers('authorization') authHeader: string,
    @Query('invitee_uri') inviteeUri: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    const accessToken = authHeader.substring(7);
    return await this.calendlyService.getInviteeDetails(accessToken, inviteeUri);
  }

  @Get('event-analytics')
  @UseGuards(AuthGuard('jwt'))
  async getEventAnalytics(
    @Headers('authorization') authHeader: string,
    @Query('event_type_uri') eventTypeUri: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    const accessToken = authHeader.substring(7);
    return await this.calendlyService.getEventAnalytics(accessToken, eventTypeUri, startDate, endDate);
  }

  @Post('custom-events')
  @UseGuards(AuthGuard('jwt'))
  async createCustomEvent(@Request() req: any, @Body() eventData: any) {
    try {
      const calendlyAccessToken = this.configService.get('CALENDLY_ACCESS_TOKEN');
      
      if (!calendlyAccessToken) {
        throw new UnauthorizedException('No se encontró token de acceso de Calendly');
      }

      const result = await this.calendlyService.createCustomEvent(calendlyAccessToken, eventData);

      return {
        message: 'Evento personalizado creado exitosamente',
        status: 'success',
        timestamp: new Date().toISOString(),
        data: result
      };
    } catch (error) {
      console.error('Error creando evento personalizado:', error);
      return {
        message: 'Error al crear evento personalizado',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  @Delete('events/:eventId')
  @UseGuards(AuthGuard('jwt'))
  async deleteEvent(@Request() req: any, @Param('eventId') eventId: string) {
    try {
      const calendlyAccessToken = this.configService.get('CALENDLY_ACCESS_TOKEN');
      
      if (!calendlyAccessToken) {
        throw new UnauthorizedException('No se encontró token de acceso de Calendly');
      }

      const result = await this.calendlyService.deleteEvent(calendlyAccessToken, eventId);

      return {
        message: 'Evento eliminado exitosamente',
        status: 'success',
        timestamp: new Date().toISOString(),
        data: result
      };
    } catch (error) {
      console.error('Error eliminando evento:', error);
      return {
        message: 'Error al eliminar evento',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Endpoint para obtener solo eventos de prueba
  @Get('test-events')
  @UseGuards(AuthGuard('jwt'))
  async getTestEvents(@Request() req: any) {
    try {
      const testEvents = this.calendlyService.getTestEvents();

      return {
        message: 'Eventos de prueba obtenidos exitosamente',
        status: 'success',
        timestamp: new Date().toISOString(),
        data: {
          collection: testEvents,
          summary: {
            total_test_events: testEvents.length
          }
        }
      };
    } catch (error) {
      console.error('Error obteniendo eventos de prueba:', error);
      return {
        message: 'Error al obtener eventos de prueba',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Endpoint para limpiar eventos de prueba
  @Delete('test-events')
  @UseGuards(AuthGuard('jwt'))
  async clearTestEvents(@Request() req: any) {
    try {
      const result = this.calendlyService.clearTestEvents();

      return {
        message: 'Eventos de prueba eliminados exitosamente',
        status: 'success',
        timestamp: new Date().toISOString(),
        data: result
      };
    } catch (error) {
      console.error('Error eliminando eventos de prueba:', error);
      return {
        message: 'Error al eliminar eventos de prueba',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}



