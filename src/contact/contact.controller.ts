import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpStatus, 
  HttpException
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('api/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    try {
      const contact = await this.contactService.create(createContactDto);
      
      return {
        success: true,
        message: 'Formulario enviado exitosamente',
        data: contact
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error interno del servidor'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('activate/:email')
  async activateContact(@Param('email') email: string) {
    try {
      const updatedContact = await this.contactService.updateStatusByEmail(
        email,
        'active',
        {
          calendlyEventType: 'Consulta de Viaje',
          calendlyStartTime: new Date(),
          calendlyRegistrationDate: new Date(),
          calendlyInviteeName: 'Usuario Calendly',
          calendlyInviteeUri: 'calendly-registration'
        }
      );

      return {
        success: true,
        message: 'Contacto activado exitosamente',
        data: updatedContact
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error activando contacto'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const contacts = await this.contactService.findAll();
      return {
        success: true,
        data: contacts
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error interno del servidor'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const contact = await this.contactService.findOne(id);
      return {
        success: true,
        data: contact
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error interno del servidor'
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    try {
      const contact = await this.contactService.updateStatus(id, body.status);
      return {
        success: true,
        message: 'Estado actualizado exitosamente',
        data: contact
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error interno del servidor'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.contactService.delete(id);
      return {
        success: true,
        message: 'Contacto eliminado exitosamente'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error interno del servidor'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


} 