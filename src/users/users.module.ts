import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModel } from '../auth/auth.model';
import { AuthSchema } from '../auth/dto/auth.dto';
import { UserModel, UserSchema } from './users.model';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema, collection: 'User' },
    ]),
  ],
  providers: [UsersService],
})
export class UsersModule {}
