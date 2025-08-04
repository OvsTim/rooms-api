import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ScheduleDocument = HydratedDocument<ScheduleModel>;
@Schema({ timestamps: true })
export class ScheduleModel {
  @Prop({ type: Types.ObjectId, ref: 'RoomModel', })
  roomId: string;
  @Prop({ required: true })
  date: Date;
}
export const ScheduleSchema = SchemaFactory.createForClass(ScheduleModel);
