import { Controller, Get, Req, Res, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  // Retorna el perfil del usuario si el token es válido
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    return req.user;
  }

  // Verifica si el JWT es válido
  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  verifyToken(@Req() req) {
    return { valid: true, user: req.user };
  }

  // Verifica el estado de autenticación (analiza cookie o header)
  @Get('status')
  async getAuthStatus(@Req() req) {
    try {
      const token = req.cookies?.jwt || req.headers.authorization?.replace('Bearer ', '');
      if (!token) return { authenticated: false };

      const user = await this.authService.verifyToken(token);
      if (!user) return { authenticated: false };

      return {
        authenticated: true,
        user: {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          picture: user.picture,
        },
      };
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return { authenticated: false };
    }
  }

  // Cierra sesión eliminando la cookie
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt');
    res.json({ message: 'Logged out successfully' });
  }

  // Registro de usuario
  @Post('register')
  async register(@Body() body: { email: string, password: string, securityQuestion: string, securityAnswer: string }) {
    try {
      const result = await this.authService.register(body);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Login de usuario
  @Post('login')
  async login(@Body() body: { email: string, password: string }) {
    try {
      const result = await this.authService.loginLocal(body);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Obtener pregunta de seguridad
  @Post('security-question')
  async getSecurityQuestion(@Body() body: { email: string }) {
    try {
      const result = await this.authService.getSecurityQuestion(body.email);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Resetear contraseña
  @Post('reset-password')
  async resetPassword(@Body() body: { email: string, securityAnswer: string, newPassword: string }) {
    try {
      const result = await this.authService.resetPassword(body);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
