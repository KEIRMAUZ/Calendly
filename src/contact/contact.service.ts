import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    try {
      const newContact = new this.contactModel(createContactDto);
      const savedContact = await newContact.save();
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