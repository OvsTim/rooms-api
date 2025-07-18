import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModel, RoomSchema } from './rooms.model';
import { RoomsService } from './rooms.service';
import { ScheduleService } from '../schedule/schedule.service';

@Module({
  controllers: [RoomsController],
  imports: [
    ScheduleService,
    MongooseModule.forFeature([
      {
        name: RoomModel.name,
        schema: RoomSchema,
        collection: 'Room',
      },
    ]),
  ],
  exports: [RoomsService],
  providers: [RoomsService],
})
export class RoomsModule {}
