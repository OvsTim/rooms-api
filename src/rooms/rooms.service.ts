import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RoomDocument, RoomModel } from './rooms.model';
import { Model, Types } from 'mongoose';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(RoomModel.name)
    private readonly roomModel: Model<RoomDocument>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<RoomModel> {
    return this.roomModel.create(createRoomDto);
  }
  async delete(id: Types.ObjectId): Promise<RoomModel | null> {
    return this.roomModel.findByIdAndDelete(id).exec();
  }
  async getRoomById(id: Types.ObjectId): Promise<RoomModel | null> {
    return this.roomModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }
  async getAllRooms(): Promise<RoomModel[]> {
    return this.roomModel.find({}).exec();
  }

  async editRoom(
    id: Types.ObjectId,
    room: Partial<RoomModel>,
  ): Promise<RoomModel | null> {
    return this.roomModel
      .findByIdAndUpdate(new Types.ObjectId(id), room)
      .exec();
  }
}
