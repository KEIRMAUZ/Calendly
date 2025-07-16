import { Controller, Get, Req, Res, UseGuards, Post } from '@nestjs/common';
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
}
