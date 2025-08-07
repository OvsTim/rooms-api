import { Prop, Schema } from '@nestjs/mongoose';
import { UserEnum } from '../users.model';

@Schema({ timestamps: true })
export class CreateUserDto {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
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
