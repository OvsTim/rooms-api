import { Types } from 'mongoose';
import { IsDate, IsUUID } from 'class-validator';

export class CreateScheduleDto {
  @IsUUID()
  roomId: Types.ObjectId;
  @IsDate()
  date: Date;
}
