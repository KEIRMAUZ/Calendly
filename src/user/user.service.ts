import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
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

    // Lógica para enviar el email de bienvenida
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: 'kevinmanuelarteagaruiz@gmail.com',
        pass: this.configService.get<string>('GMAIL_PASSWORD_API'),
      },
    });

    await transporter.sendMail({
      from: 'UTSH Viajes <hola@utshviajes.com>',
      to: user.email,
      subject: '¡Bienvenido a UTSH Viajes! ✈️',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 40px; text-align: center;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            
            <div style="background: #2a5298; padding: 24px;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0;">UTSH Viajes</h1>
            </div>
    
            <div style="padding: 32px;">
              <h2 style="color: #2a5298; text-align: center; font-size: 28px; margin-bottom: 16px;">
                ¡Hola, ${user.name}! 🌍
              </h2>
              <p style="font-size: 18px; color: #555; line-height: 1.6; margin-bottom: 24px;">
                ¡Estamos muy emocionados de tenerte con nosotros! Tu cuenta ha sido creada exitosamente.
              </p>
              <p style="font-size: 18px; color: #555; line-height: 1.6; margin-bottom: 32px;">
                Ahora eres parte de nuestra comunidad de viajeros. ¿Qué esperas para empezar a planear tu próxima aventura?
              </p>
    
              <div style="text-align: center; margin-bottom: 40px;">
                <a href="https://viajes-8vgc.vercel.app/" style="background: #5a82c4; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: bold; display: inline-block; transition: background 0.3s ease;">
                  Explora nuestros destinos
                </a>
              </div>
    
              <p style="font-size: 16px; color: #888; text-align: center;">
                ¿Necesitas ayuda? Responde a este correo o visita nuestra sección de preguntas frecuentes.
              </p>
            </div>
            
            <div style="background: #e3ecfa; padding: 24px; border-top: 1px solid #d4dbe9; text-align: center;">
              <p style="font-size: 14px; color: #777; margin: 0;">
                © ${new Date().getFullYear()} UTSH Viajes. Todos los derechos reservados.
              </p>
            </div>
    
          </div>
        </div>
      `,
    });

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