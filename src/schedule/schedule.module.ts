import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModel, ScheduleSchema } from './schedule.model';
import { ScheduleService } from './schedule.service';

@Module({
  controllers: [ScheduleController],
  imports: [
    MongooseModule.forFeature([
      {
        name: ScheduleModel.name,
        schema: ScheduleSchema,
        collection: 'Room',
      },
    ]),
  ],
  providers: [ScheduleService],
})
export class ScheduleModule {}
