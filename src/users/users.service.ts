import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel } from './users.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
  ) {}

  async getByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async getById(id: Types.ObjectId) {
    return this.userModel.findById(id).exec();
  }
  async getAllUsers() {
    return this.userModel.find({}).exec();
  }

  async createUser({ email, password }: { email: string; password: string }) {
    const newUser = new this.userModel(email, password);

    return newUser.save();
  }

  async deleteUser(id: Types.ObjectId) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
  async updateUser(id: Types.ObjectId, user: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, user).exec();
  }
}
