import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ScheduleDocument, ScheduleModel } from './schedule.model';
import { Model, Types } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleModel.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
  ) {}

  async create(dto: CreateScheduleDto): Promise<ScheduleModel> {
    return this.scheduleModel.create(dto);
  }
  async delete(id: string): Promise<ScheduleModel | null> {
    return this.scheduleModel.findByIdAndDelete(id).exec();
  }
  async getScheduleById(id: string): Promise<ScheduleModel | null> {
    return this.scheduleModel.findOne({ id: new Types.ObjectId(id) }).exec();
  }
  async getAllSchedules(): Promise<ScheduleModel[]> {
    return this.scheduleModel.find({}).exec();
  }

  async getScheduleByRoomId(id: string): Promise<ScheduleModel[] | null> {
    return this.scheduleModel.find({ roomId: new Types.ObjectId(id) }).exec();
  }
  async deleteScheduleByRoomId(id: string) {
    return this.scheduleModel
      .findByIdAndDelete({ roomId: new Types.ObjectId(id) })
      .exec();
  }

  async editSchedule(
    id: string,
    schedule: Partial<ScheduleModel>,
  ): Promise<ScheduleModel | null> {
    return this.scheduleModel
      .findByIdAndUpdate({ id: new Types.ObjectId(id), schedule })
      .exec();
  }
}
