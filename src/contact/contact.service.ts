import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    private readonly configService: ConfigService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    try {
      const newContact = new this.contactModel(createContactDto);
      const savedContact = await newContact.save();
      console.log('Contacto guardado en MongoDB:', savedContact);

      // Enviar email con Nodemailer y SMTP de Mailtrap
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'kevinmanuelarteagaruiz@gmail.com', 
          pass: this.configService.get<string>('GMAIL_PASSWORD_API'), 
        },
      });

      await transporter.sendMail({
        from: 'UTSH Viajes <hi@demomailtrap.co>',
        to: savedContact.email, 
        subject: '¡Gracias por tu pre-registro en UTSH Viajes!',
        html: `
          <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 32px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
              <h2 style="color: #2a5298; text-align: center;">¡Gracias por tu preferencia, ${savedContact.name}!</h2>
              <p style="font-size: 1.1em; color: #333;">
                Hemos recibido tu <b>pre-registro</b> para el destino <span style="color: #2a5298;">${savedContact.destination}</span>.
              </p>
              <p style="font-size: 1.1em; color: #333;">
                Para completar tu registro, por favor utiliza el enlace que te proporcionó la página después de tu pre-registro.
              </p>
              <div style="background: #e3ecfa; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <b>¿Perdiste el enlace?</b><br>
                Si no encuentras el enlace para finalizar tu registro, por favor realiza el pre-registro nuevamente desde nuestra página web.
              </div>
              <p style="font-size: 1.1em; color: #333;">
                <b>¡Gracias por confiar en UTSH Viajes!</b><br>
                Pronto nos pondremos en contacto contigo para más información.
              </p>
              <hr style="margin: 32px 0;">
              <p style="font-size: 0.95em; color: #888; text-align: center;">
                Si tienes dudas, responde a este correo o visita nuestra página.
              </p>
            </div>
          </div>
        `,
      });

      return savedContact;
    } catch (error) {
      throw new Error(`Error creating contact: ${error.message}`);
    }
  }

  async findAll(): Promise<Contact[]> {
    try {
      return await this.contactModel.find().sort({ createdAt: -1 }).exec();
    } catch (error) {
      throw new Error(`Error fetching contacts: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Contact> {
    try {
      const contact = await this.contactModel.findById(id).exec();
      if (!contact) {
        throw new Error('Contact not found');
      }
      return contact;
    } catch (error) {
      throw new Error(`Error fetching contact: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: string): Promise<Contact> {
    try {
      const contact = await this.contactModel.findByIdAndUpdate(
        id,
        { 
          status,
          processed: status === 'processed',
          processedAt: status === 'processed' ? new Date() : null
        },
        { new: true }
      ).exec();
      
      if (!contact) {
        throw new Error('Contact not found');
      }
      return contact;
    } catch (error) {
      throw new Error(`Error updating contact: ${error.message}`);
    }
  }

  async updateStatusByEmail(email: string, status: string, additionalData?: any): Promise<Contact> {
    try {
      const updateData: any = { 
        status,
        processed: status === 'active',
        processedAt: status === 'active' ? new Date() : null
      };

      if (additionalData) {
        Object.assign(updateData, additionalData);
      }

      const contact = await this.contactModel.findOneAndUpdate(
        { email: email.toLowerCase() },
        updateData,
        { new: true }
      ).exec();
      
      if (!contact) {
        throw new Error(`Contact with email ${email} not found`);
      }

      return contact;
    } catch (error) {
      throw new Error(`Error updating contact by email: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.contactModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new Error('Contact not found');
      }
    } catch (error) {
      throw new Error(`Error deleting contact: ${error.message}`);
    }
  }
} 