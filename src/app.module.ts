import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
      AuthModule, 
      ConfigModule.forRoot(),
      MongooseModule.forRoot(process.env.MONGO_URL, { dbName: process.env.MONGO_DB_NAME }),
      JwtModule.register({
        global: true,
        secret: process.env.JWT_SEED,
        signOptions: { expiresIn: '6h' },
      }),
    
    ],
  controllers: [],
  providers: [],
})
export class AppModule {
 
}
