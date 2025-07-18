import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModel, ScheduleSchema } from './schedule.model';
import { ScheduleService } from './schedule.service';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  controllers: [ScheduleController],
  imports: [
    RoomsModule,
    MongooseModule.forFeature([
      {
        name: ScheduleModel.name,
        schema: ScheduleSchema,
        collection: 'Schedule',
      },
    ]),
  ],
  exports: [ScheduleService],
  providers: [ScheduleService],
})
export class ScheduleModule {}
