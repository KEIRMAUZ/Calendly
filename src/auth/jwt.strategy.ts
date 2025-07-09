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

        (request) => {
          console.log('🔍 JWT Strategy: Checking cookies...');
          console.log('📋 Request cookies:', request?.cookies);
          
          if (request && request.cookies) {
            const token = request.cookies['jwt'];
            console.log('🍪 JWT Token from cookie:', token ? 'Presente' : 'Ausente');
            return token;
          }
          console.log('❌ No cookies found in request');
          return null;
        },
        (request) => {
          console.log('🔍 JWT Strategy: Checking Authorization header...');
          const authHeader = request?.headers?.authorization;
          console.log('📋 Authorization header:', authHeader ? 'Presente' : 'Ausente');
          
          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            console.log('🔑 JWT Token from header:', token ? 'Presente' : 'Ausente');
            return token;
          }
          return null;
        },
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