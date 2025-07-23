import { Types } from 'mongoose';

export class CreateScheduleDto {
  roomId: Types.ObjectId;
  date: Date;
}
