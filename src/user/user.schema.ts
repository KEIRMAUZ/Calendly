import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string; // Hasheada

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  securityQuestion: string;

  @Prop({ required: true })
  securityAnswer: string; // Hasheada
}

export const UserSchema = SchemaFactory.createForClass(User); 