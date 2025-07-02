import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secretOrKey = configService.get<string>('JWT_SECRET', 'your-secret-key');
    
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primero intentar extraer de las cookies
        (request) => {
          if (request && request.cookies) {
            return request.cookies['jwt_token'];
          }
          return null;
        },
        // Si no hay cookie, intentar del header Authorization
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      picture: payload.picture
    };
  }
} 