import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getJwtConfig } from '../configs/jwt.config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModel } from './auth.model';
import { AuthSchema } from './dto/auth.dto';
import { UserModel, UserSchema } from 'src/users/users.model';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  imports: [
    MongooseModule.forFeature([
      { name: AuthModel.name, schema: AuthSchema, collection: 'Auth' },
      { name: UserModel.name, schema: UserSchema, collection: 'User' },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    PassportModule,
    ConfigModule,
  ],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
