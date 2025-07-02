import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:3000/google/callback');

    if (!clientID || !clientSecret) {
      throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be defined in environment variables');
    }

    // Log para debugging
    console.log('🔐 Google OAuth Configuration:');
    console.log('   Client ID:', clientID ? '✅ Configurado' : '❌ No configurado');
    console.log('   Client Secret:', clientSecret ? '✅ Configurado' : '❌ No configurado');
    console.log('   Callback URL:', callbackURL);
    console.log('   ⚠️  Asegúrate de que esta URL esté en Google Console');

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log('🔍 Perfil original de Google:', JSON.stringify(profile, null, 2));
    
    const { id, name, emails, photos } = profile;
    
    // Validar que los datos necesarios existan
    if (!emails || !emails.length) {
      return done(new Error('Email no encontrado en el perfil de Google'), undefined);
    }
    
    if (!name) {
      return done(new Error('Nombre no encontrado en el perfil de Google'), undefined);
    }
    
    const user = {
      googleId: id, // ID original de Google
      email: emails[0].value,
      firstName: name.givenName || 'Usuario',
      lastName: name.familyName || 'Google',
      picture: photos && photos.length > 0 ? photos[0].value : null,
      accessToken,
    };
    
    console.log('✅ Usuario procesado por estrategia:', user);
    done(null, user);
  }
} 