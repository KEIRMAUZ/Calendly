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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard will handle the authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      console.log('🔄 Procesando callback de Google...');
      console.log('Usuario recibido:', req.user);
      
      if (!req.user) {
        console.error('❌ No se recibió usuario de Google');
        return res.redirect(`${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}?error=no_user`);
      }

      const user = await this.authService.validateGoogleUser(req.user);
      const result = await this.authService.login(user);
      
      console.log('✅ Autenticación exitosa, estableciendo cookie...');
      
      // Establecer cookie JWT con configuración mejorada
      res.cookie('jwt', result.access_token, {
        httpOnly: true,
        secure: false, // Cambiar a true en producción con HTTPS
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        path: '/', // Importante: establecer el path
        domain: 'localhost' // Especificar el dominio
      });
      
      // Redirect to frontend
      const redirectUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}?success=true`;
      console.log('🔄 Redirigiendo a:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error en callback de Google:', error);
      const redirectUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}?error=auth_failed&message=${encodeURIComponent(error.message)}`;
      res.redirect(redirectUrl);
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    return req.user;
  }

  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  verifyToken(@Req() req) {
    return { valid: true, user: req.user };
  }

  @Get('status')
  async getAuthStatus(@Req() req) {
    try {
      // Verificar si hay un token en las cookies o headers
      const token = req.cookies?.jwt || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return { authenticated: false };
      }

      // Verificar el token
      const user = await this.authService.verifyToken(token);
      if (!user) {
        return { authenticated: false };
      }

      return { 
        authenticated: true, 
        user: {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          picture: user.picture
        }
      };
    } catch (error) {
      console.error('Error verificando estado de autenticación:', error);
      return { authenticated: false };
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    // Limpiar la cookie JWT
    res.clearCookie('jwt');
    res.json({ message: 'Logged out successfully' });
  }
}

// Controlador adicional para manejar la ruta /google/callback (redirección de Google)
@Controller('google')
export class GoogleCallbackController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    try {
      console.log('🔄 Procesando callback de Google (ruta alternativa)...');
      console.log('Usuario recibido:', req.user);
      
      if (!req.user) {
        console.error('❌ No se recibió usuario de Google');
        return res.redirect(`${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}?error=no_user`);
      }

      const user = await this.authService.validateGoogleUser(req.user);
      const result = await this.authService.login(user);
      
      console.log('✅ Autenticación exitosa, estableciendo cookie...');
      
      // Establecer cookie JWT con configuración mejorada
      res.cookie('jwt', result.access_token, {
        httpOnly: true,
        secure: false, // Cambiar a true en producción con HTTPS
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        path: '/', // Importante: establecer el path
        domain: 'localhost' // Especificar el dominio
      });
      
      // Redirect to frontend
      const redirectUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}?success=true`;
      console.log('🔄 Redirigiendo a:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error en callback de Google (ruta alternativa):', error);
      const redirectUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}?error=auth_failed&message=${encodeURIComponent(error.message)}`;
      res.redirect(redirectUrl);
    }
  }
}
