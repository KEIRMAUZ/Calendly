import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async register({ name, email, password, securityQuestion, securityAnswer }: { name: string, email: string, password: string, securityQuestion: string, securityAnswer: string }) {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new Error('El usuario ya existe');
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityAnswer, 10);
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: hashedAnswer,
    });
    await user.save();
    return { success: true, message: 'Usuario registrado correctamente' };
  }

  async login({ email, password }: { email: string, password: string }) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new Error('Usuario o contraseña incorrectos');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Usuario o contraseña incorrectos');
    return { success: true, user: { email: user.email } };
  }

  async getSecurityQuestion(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new Error('Usuario no encontrado');
    return { question: user.securityQuestion };
  }

  async resetPassword({ email, securityAnswer, newPassword }: { email: string, securityAnswer: string, newPassword: string }) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new Error('Usuario no encontrado');
    const valid = await bcrypt.compare(securityAnswer, user.securityAnswer);
    if (!valid) throw new Error('Respuesta de seguridad incorrecta');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { success: true, message: 'Contraseña actualizada correctamente' };
  }
} 