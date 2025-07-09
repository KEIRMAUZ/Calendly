import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  calendlyEventId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  inviteeEmail: string;

  @Prop()
  inviteeName: string;

  @Prop()
  inviteePhone: string;

  @Prop()
  organizerEmail: string;

  @Prop()
  organizerName: string;

  @Prop()
  location: string;

  @Prop()
  description: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  cancelReason: string;

  @Prop({ required: true })
  calendlyUri: string;

  @Prop()
  inviteeUri: string;

  @Prop()
  eventTypeUri: string;

  @Prop({ type: Object })
  calendlyData: any;

  @Prop({ type: Object })
  inviteeData: any;

  @Prop({ default: false })
  emailSent: boolean;

  @Prop()
  emailSentAt: Date;

  @Prop({ default: false })
  webhookProcessed: boolean;

  @Prop()
  webhookProcessedAt: Date;

  @Prop()
  webhookType: string; // 'invitee.created', 'invitee.canceled'

  @Prop({ type: Object })
  webhookPayload: any;
}

export const EventSchema = SchemaFactory.createForClass(Event); 