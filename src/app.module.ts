import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true
    }),
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
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: []
})
export class AppModule {}
