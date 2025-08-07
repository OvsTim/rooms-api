import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class AuthDto {
  @Prop({ required: true, unique: true })
  login: string;
  @Prop({ required: true })
  password: string;
}

export const AuthSchema = SchemaFactory.createForClass(AuthDto);
