import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsArray } from 'class-validator';

export type RoomDocument = HydratedDocument<RoomModel>;
@Schema({ timestamps: true })
export class RoomModel {
  @Prop({ required: true })
  number: number;
  @Prop({ required: true })
  type: string;
  @Prop({ required: true })
  hasSeaView: boolean;
  @Prop({ required: true })
  images: string[];
}

export const RoomSchema = SchemaFactory.createForClass(RoomModel);
