import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true })
  destination: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: false })
  processed: boolean;

  @Prop()
  processedAt: Date;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  calendlyEventType: string;

  @Prop()
  calendlyStartTime: Date;

  @Prop()
  calendlyRegistrationDate: Date;

  @Prop()
  calendlyInviteeName: string;

  @Prop()
  calendlyInviteeUri: string;

  @Prop({ type: Object })
  calendlyEventDetails: any;
}

export const ContactSchema = SchemaFactory.createForClass(Contact); 