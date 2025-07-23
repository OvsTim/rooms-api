import { forwardRef, Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModel, RoomSchema } from './rooms.model';
import { RoomsService } from './rooms.service';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  controllers: [RoomsController],
  imports: [
    forwardRef(() => ScheduleModule),
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
