import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CalendlyModule } from './calendly/calendly.module';
import { ContactModule } from './contact/contact.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true
    }),
    HttpModule,
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const mongoPassword = process.env.MONGO_PASSWORD;
        const mongoUri = `mongodb+srv://keirmauz:${mongoPassword}@cluster0.yvdjajg.mongodb.net/Calendly`;
        
        return {
          uri: mongoUri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
    }),
    AuthModule,
    CalendlyModule,
    ContactModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: []
})
export class AppModule {}
