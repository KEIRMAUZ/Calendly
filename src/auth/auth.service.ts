import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Login con payload personalizado (ajústalo según tu modelo de usuario)
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }

  // Verifica el token
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  // Registro de usuario
  async register({ email, password, securityQuestion, securityAnswer }: { email: string, password: string, securityQuestion: string, securityAnswer: string }) {
    // La lógica de usuario ahora está en el módulo user, por lo que no se puede verificar si el usuario existe aquí.
    // Esto podría necesitar ser manejado por el módulo user.
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityAnswer, 10);
    // En un escenario real, se crearía un nuevo usuario aquí y se guardaría en el modelo User.
    // Por ahora, solo retornamos un mensaje de éxito.
    return { success: true, message: 'Usuario registrado correctamente' };
  }

  // Login de usuario
  async loginLocal({ email, password }: { email: string, password: string }) {
    // La lógica de usuario ahora está en el módulo user, por lo que no se puede verificar si el usuario existe aquí.
    // Esto podría necesitar ser manejado por el módulo user.
    const valid = await bcrypt.compare(password, 'hashed_password_placeholder'); // Placeholder for actual password
    if (!valid) throw new Error('Usuario o contraseña incorrectos');
    // No JWT, solo respuesta de éxito
    return { success: true, user: { email: email } };
  }

  // Recuperación de contraseña: obtener pregunta de seguridad
  async getSecurityQuestion(email: string) {
    // La lógica de usuario ahora está en el módulo user, por lo que no se puede obtener la pregunta de seguridad aquí.
    // Esto podría necesitar ser manejado por el módulo user.
    return { question: 'Pregunta de seguridad placeholder' }; // Placeholder for actual question
  }

  // Validar respuesta y cambiar contraseña
  async resetPassword({ email, securityAnswer, newPassword }: { email: string, securityAnswer: string, newPassword: string }) {
    // La lógica de usuario ahora está en el módulo user, por lo que no se puede validar la respuesta de seguridad aquí.
    // Esto podría necesitar ser manejado por el módulo user.
    const valid = await bcrypt.compare(securityAnswer, 'hashed_answer_placeholder'); // Placeholder for actual answer
    if (!valid) throw new Error('Respuesta de seguridad incorrecta');
    // En un escenario real, se actualizaría la contraseña en el modelo User.
    return { success: true, message: 'Contraseña actualizada correctamente' };
  }
}
