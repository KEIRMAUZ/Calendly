import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private mailerSend: MailerSend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('API_KEY_MAIL');
    if (!apiKey) {
      this.logger.error('API_KEY_MAIL no está configurada en las variables de entorno');
      throw new Error('API_KEY_MAIL no está configurada');
    }
    
    this.mailerSend = new MailerSend({ apiKey });
    this.logger.log('Servicio de email inicializado correctamente');
  }

  /**
   * Envía email de confirmación cuando se crea un nuevo contacto
   */
  async sendContactConfirmation(contactData: {
    name: string;
    email: string;
    destination: string;
    message: string;
  }): Promise<boolean> {
    try {
      const sentFrom = new Sender(
        '2022023@utsh.edu.mx', // Cambia por tu dominio verificado
        'VIAJES UTSH'
      );

      const recipients = [
        new Recipient(contactData.email, contactData.name)
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(`¡Gracias por contactarnos, ${contactData.name}!`)
        .setHtml(this.generateContactConfirmationHTML(contactData))
        .setText(this.generateContactConfirmationText(contactData));

      const result = await this.mailerSend.email.send(emailParams);
      
      this.logger.log(`Email de confirmación enviado a ${contactData.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email de confirmación a ${contactData.email}:`, error);
      return false;
    }
  }

  /**
   * Envía email de notificación al administrador cuando se crea un nuevo contacto
   */
  async sendAdminNotification(contactData: {
    name: string;
    email: string;
    destination: string;
    message: string;
  }): Promise<boolean> {
    try {
      const sentFrom = new Sender(
        '2022023@utsh.edu.mx', // Cambia por tu dominio verificado
        'VIAJES UTSH - Sistema de Notificaciones'
      );

      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@viajesutsh.com';
      
      const recipients = [
        new Recipient(adminEmail, 'Administrador ViajesUtsh')
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(new Sender(contactData.email, contactData.name))
        .setSubject(`Nuevo contacto recibido - ${contactData.destination}`)
        .setHtml(this.generateAdminNotificationHTML(contactData))
        .setText(this.generateAdminNotificationText(contactData));

      const result = await this.mailerSend.email.send(emailParams);
      
      this.logger.log(`Notificación de administrador enviada para contacto de ${contactData.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando notificación de administrador:`, error);
      return false;
    }
  }

  /**
   * Envía email cuando se activa un contacto (después de Calendly)
   */
  async sendActivationEmail(contactData: {
    name: string;
    email: string;
    destination: string;
    calendlyEventType?: string;
    calendlyStartTime?: Date;
  }): Promise<boolean> {
    try {
      const sentFrom = new Sender(
        '2022023@utsh.edu.mx', // Cambia por tu dominio verificado
        'VIAJES UTSH'
      );

      const recipients = [
        new Recipient(contactData.email, contactData.name)
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(`¡Tu consulta ha sido activada! - ${contactData.destination}`)
        .setHtml(this.generateActivationHTML(contactData))
        .setText(this.generateActivationText(contactData));

      const result = await this.mailerSend.email.send(emailParams);
      
      this.logger.log(`Email de activación enviado a ${contactData.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email de activación a ${contactData.email}:`, error);
      return false;
    }
  }

  /**
   * Envía email personalizado con template
   */
  async sendCustomEmail(to: string, toName: string, subject: string, htmlContent: string, textContent?: string): Promise<boolean> {
    try {
      const sentFrom = new Sender(
        '2022023@utsh.edu.mx', // Cambia por tu dominio verificado
        'VIAJES UTSH'
      );

      const recipients = [
        new Recipient(to, toName)
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(subject)
        .setHtml(htmlContent)
        .setText(textContent || this.stripHtml(htmlContent));

      const result = await this.mailerSend.email.send(emailParams);
      
      this.logger.log(`Email personalizado enviado a ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email personalizado a ${to}:`, error);
      return false;
    }
  }

  // Métodos privados para generar contenido HTML y texto

  private generateContactConfirmationHTML(contactData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Preagenda - VIAJES UTSH</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667ea 0%, #400640 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 10px; }
          .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por contactarnos y preagendar tu cita!</h1>
            <p>VIAJES UTSH</p>
          </div>
          <div class="content">
            <h2>Hola ${contactData.name},</h2>
            <p>Queremos agradecerte sinceramente por tu preferencia y por confiar en nosotros para planear tu próxima experiencia de viaje.</p>
            <p>Hemos recibido tu solicitud y uno de nuestros asesores se pondrá en contacto contigo muy pronto para confirmar los detalles y ayudarte a organizar tu viaje ideal.</p>
            <div class="highlight">
              <h3>Datos de tu preagenda:</h3>
              <p><strong>Nombre:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Destino:</strong> ${contactData.destination}</p>
              <p><strong>Mensaje:</strong> ${contactData.message}</p>
            </div>
            <p>¡Gracias por elegirnos!<br>El equipo de VIAJES UTSH</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2024 VIAJES UTSH. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateContactConfirmationText(contactData: any): string {
    return `
¡Gracias por contactarnos y preagendar tu cita!

Hola ${contactData.name},

Queremos agradecerte sinceramente por tu preferencia y por confiar en nosotros para planear tu próxima experiencia de viaje.

Hemos recibido tu solicitud y uno de nuestros asesores se pondrá en contacto contigo muy pronto para confirmar los detalles y ayudarte a organizar tu viaje ideal.

Datos de tu preagenda:
- Nombre: ${contactData.name}
- Email: ${contactData.email}
- Destino: ${contactData.destination}
- Mensaje: ${contactData.message}

¡Gracias por elegirnos!
El equipo de VIAJES UTSH

---
Este es un email automático, por favor no respondas a este mensaje.
© 2024 VIAJES UTSH. Todos los derechos reservados.
    `;
  }

  private generateAdminNotificationHTML(contactData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo Contacto - ViajesUtsh</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px 0; }
          .content { background: #f99f9; padding: 30px; border-radius: 0 10px; }
          .contact-info { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🆕 Nuevo Contacto Recibido</h1>
            <p>ViajesUtsh - Sistema de Notificaciones</p>
          </div>
          
          <div class="content">
            <h2>Se ha recibido una nueva consulta de viaje</h2>
            
            <div class="contact-info">
              <h3>📋 Información del Contacto:</h3>
              <p><strong>Nombre:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              <p><strong>Destino:</strong> ${contactData.destination}</p>
              <p><strong>Mensaje:</strong> ${contactData.message}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            </div>
            
            <p>Este contacto requiere atención inmediata. Por favor, responde al cliente lo antes posible para mantener un excelente servicio al cliente.</p>
            
            <p>Puedes responder directamente a este email para contactar al cliente.</p>
            
            <p>¡Gracias por tu atención!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 ViajesUtsh. Sistema de notificaciones automáticas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAdminNotificationText(contactData: any): string {
    return `
🆕 NUEVO CONTACTO RECIBIDO

Se ha recibido una nueva consulta de viaje

📋 Información del Contacto:
- Nombre: ${contactData.name}
- Email: ${contactData.email}
- Destino: ${contactData.destination}
- Mensaje: ${contactData.message}
- Fecha: ${new Date().toLocaleString('es-ES')}

Este contacto requiere atención inmediata. Por favor, responde al cliente lo antes posible para mantener un excelente servicio al cliente.

Puedes responder directamente a este email para contactar al cliente.

¡Gracias por tu atención!

---
© 2024 ViajesUtsh. Sistema de notificaciones automáticas.
    `;
  }

  private generateActivationHTML(contactData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Consulta Activada - ViajesUtsh</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4caf5005a049 100%, #400640 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 0; }
          .content { background: #f99f9; padding: 30px; border-radius: 0 10px; }
          .success-box { background: #d4dda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ¡Tu consulta ha sido activada!</h1>
            <p>ViajesUtsh - Proceso de reserva iniciado</p>
          </div>
          
          <div class="content">
            <h2>Hola ${contactData.name},</h2>
            
            <div class="success-box">
              <h3>🎉 ¡Excelente noticia!</h3>
              <p>Tu consulta sobre <strong>${contactData.destination}</strong> ha sido activada y nuestro equipo ya está trabajando en tu solicitud.</p>
            </div>
            
            <p>Esto significa que:</p>
            <ul>
              <li>✅ Tu consulta ha sido revisada y aprobada</li>
              <li>✅ Nuestro equipo de expertos está preparando tu itinerario</li>
              <li>✅ Pronto recibirás una propuesta personalizada</li>
            </ul>
            
            ${contactData.calendlyEventType ? `
              <p><strong>Evento programado:</strong> ${contactData.calendlyEventType}</p>
              ${contactData.calendlyStartTime ? `<p><strong>Fecha programada:</strong> ${new Date(contactData.calendlyStartTime).toLocaleString('es-ES')}</p>` : ''}
            ` : `
              <p>En los próximos días recibirás:</p>
              <ul>
                <li>📋 Una propuesta detallada de tu viaje</li>
                <li>💰 Información sobre precios y opciones de pago</li>
                <li>📅 Posibles fechas de viaje</li>
                <li>🎯 Recomendaciones personalizadas</li>
              </ul>
            `}
            
            <p>¡Gracias por confiar en ViajesUtsh para hacer de tu viaje una experiencia inolvidable!</p>
            
            <p>Saludos cordiales,<br>
            <strong>El equipo de ViajesUtsh</strong></p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© 2024 ViajesUtsh. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateActivationText(contactData: any): string {
    return `
✅ ¡Tu consulta ha sido activada!

Hola ${contactData.name},

🎉 ¡Excelente noticia! Tu consulta sobre ${contactData.destination} ha sido activada y nuestro equipo ya está trabajando en tu solicitud.

Esto significa que:
✅ Tu consulta ha sido revisada y aprobada
✅ Nuestro equipo de expertos está preparando tu itinerario
✅ Pronto recibirás una propuesta personalizada

${contactData.calendlyEventType ? `
Evento programado: ${contactData.calendlyEventType}
${contactData.calendlyStartTime ? `Fecha programada: ${new Date(contactData.calendlyStartTime).toLocaleString('es-ES')}` : ''}
` : `
En los próximos días recibirás:
📋 Una propuesta detallada de tu viaje
💰 Información sobre precios y opciones de pago
📅 Posibles fechas de viaje
🎯 Recomendaciones personalizadas
`}

¡Gracias por confiar en ViajesUtsh para hacer de tu viaje una experiencia inolvidable!

Saludos cordiales,
El equipo de ViajesUtsh

---
Este es un email automático, por favor no respondas a este mensaje.
© 2024 ViajesUtsh. Todos los derechos reservados.
    `;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
} 