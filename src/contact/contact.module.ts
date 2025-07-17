import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './schemas/contact.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema }
    ]),
    EmailModule
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService]
})
export class ContactModule {} 