import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModel, RoomSchema } from './rooms.model';
import { RoomsService } from './rooms.service';

@Module({
  controllers: [RoomsController],
  imports: [
    MongooseModule.forFeature([
      {
        name: RoomModel.name,
        schema: RoomSchema,
        collection: 'Room',
      },
    ]),
  ],
  providers: [RoomsService],
})
export class RoomsModule {}
