import { Types } from 'mongoose';
import { IsDate, IsMongoId } from 'class-validator';

export class UpdateScheduleDto {
  @IsMongoId()
  roomId?: Types.ObjectId;
  @IsDate()
  date?: Date;
}
