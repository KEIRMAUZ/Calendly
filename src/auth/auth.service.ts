import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateGoogleUser(profile: any) {
    console.log('🔍 Validando perfil de Google:', JSON.stringify(profile, null, 2));
    
    // El perfil que recibimos ya está procesado por la estrategia de Google
    // Contiene: googleId, email, firstName, lastName, picture, accessToken
    const { googleId, email, firstName, lastName, picture, accessToken } = profile;
    
    // Validar que los datos necesarios existan
    if (!googleId) {
      throw new Error('Google ID no encontrado en el perfil');
    }
    
    if (!email) {
      throw new Error('Email no encontrado en el perfil de Google');
    }
    
    if (!firstName) {
      throw new Error('Nombre no encontrado en el perfil de Google');
    }
    
    const user = {
      googleId: googleId,
      email: email,
      firstName: firstName,
      lastName: lastName || 'Usuario',
      picture: picture || null,
      accessToken: accessToken,
    };

    console.log('✅ Usuario validado:', user);
    return user;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.googleId,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.googleId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture
      }
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}
