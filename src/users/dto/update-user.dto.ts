import { Prop, Schema } from '@nestjs/mongoose';
import { UserEnum } from '../users.model';

export class UpdateUserDto {
  @Prop()
  email: string;
  @Prop()
  password: string;
  @Prop()
  name: string;
  @Prop()
  phone: string;
  @Prop({
    type: [String],
    enum: [UserEnum.ADMIN, UserEnum.USER],
  })
  role: UserEnum[];
}
