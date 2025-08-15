import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserModel>;

export enum UserEnum {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema()
export class UserModel {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  passwordHash: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  phone: string;
  @Prop({
    required: true,
    type: [String],
    enum: [UserEnum.ADMIN, UserEnum.USER],
  })
  role: UserEnum[];
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
