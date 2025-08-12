import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ScheduleDocument, ScheduleModel } from './schedule.model';
import { Model, Types } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleModel.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
  ) {}

  async create(dto: CreateScheduleDto): Promise<ScheduleModel> {
    return this.scheduleModel.create(dto);
  }
  async delete(id: Types.ObjectId): Promise<ScheduleModel | null> {
    return this.scheduleModel.findByIdAndDelete(id).exec();
  }
  async getScheduleById(id: Types.ObjectId): Promise<ScheduleModel | null> {
    return this.scheduleModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }
  async getAllSchedules(): Promise<ScheduleModel[]> {
    return this.scheduleModel.find({}).exec();
  }

  async getScheduleByRoomId(id: Types.ObjectId) {
    return this.scheduleModel.find({ roomId: id }).exec();
  }
  async deleteScheduleByRoomId(id: Types.ObjectId) {
    return this.scheduleModel
      .deleteMany({ roomId: new Types.ObjectId(id) })
      .exec();
  }

  async editSchedule(
    id: Types.ObjectId,
    schedule: UpdateScheduleDto,
  ): Promise<ScheduleModel | null> {
    return this.scheduleModel
      .findByIdAndUpdate(new Types.ObjectId(id), schedule)
      .exec();
  }
  async getRoomBookingStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Последний день месяца

    return this.scheduleModel.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: 'rooms', // Название коллекции комнат
          localField: 'roomId',
          foreignField: '_id',
          as: 'room',
        },
      },
      {
        $unwind: '$room',
      },
      {
        $group: {
          _id: '$room.number',
          bookingCount: { $sum: 1 },
        },
      },
      {
        $project: {
          roomNumber: '$_id',
          bookingCount: 1,
          _id: 0,
        },
      },
      {
        $sort: { bookingCount: -1 },
      },
    ]);
  }
}
