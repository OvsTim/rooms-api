import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { RoomsService } from '../rooms/rooms.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ROOM_SCHEDULED, SCHEDULE_NOT_FOUND } from './schedule-constants';
import { ScheduleModel } from './schedule.model';
import { areDatesEqual } from '../utils/dateUtils';
import { ROOM_NOT_FOUND } from '../rooms/room-constants';
import { Types } from 'mongoose';

@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly roomsService: RoomsService,
  ) {}

  @Post('create')
  async createSchedule(@Body() dto: CreateScheduleDto) {
    const room = await this.roomsService.getRoomById(dto.roomId);
    if (!room) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const schedules = await this.scheduleService.getScheduleByRoomId(
      dto.roomId,
    );
    if (schedules?.length === 0) {
      return this.scheduleService.create(dto);
    }

    for (const schedule of schedules) {
      if (areDatesEqual(schedule.date, dto.date)) {
        throw new HttpException(ROOM_SCHEDULED, HttpStatus.CONFLICT);
      }
    }

    return await this.scheduleService.create(dto);
  }

  @Get(':id')
  async getSchedule(@Param('id') id: Types.ObjectId) {
    const schedule = await this.scheduleService.getScheduleById(id);
    if (!schedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return schedule;
  }

  @Get()
  async getAllSchedules(): Promise<ScheduleModel[]> {
    return this.scheduleService.getAllSchedules();
  }

  @Delete(':id')
  async deleteSchedule(@Param('id') id: Types.ObjectId) {
    const schedule = await this.scheduleService.delete(id);
    if (!schedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return schedule;
  }

  @Patch(':id')
  async patch(
    @Param('id') id: Types.ObjectId,
    @Body() dto: Partial<ScheduleModel>,
  ) {
    const schedule = await this.scheduleService.getScheduleById(id);
    if (!schedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (dto.roomId !== undefined) {
      const room = await this.roomsService.getRoomById(dto.roomId);
      if (!room) {
        throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
    }
    if (dto.roomId !== undefined || dto.date !== undefined) {
      const schedules = await this.scheduleService.getScheduleByRoomId(
        schedule.roomId,
      );
      for (const existingSchedule of schedules) {
        const targetRoomId =
          dto.roomId !== undefined ? dto.roomId : schedule.roomId;
        if (
          existingSchedule._id.toString() !== id.toString() &&
          existingSchedule.roomId.toString() === targetRoomId.toString() &&
          dto.date &&
          areDatesEqual(existingSchedule.date, dto.date)
        ) {
          throw new HttpException(ROOM_SCHEDULED, HttpStatus.CONFLICT);
        }
      }
    }

    return this.scheduleService.editSchedule(id, dto);
  }
  @Get('byRoom/:roomId')
  async get(@Param('roomId') id: Types.ObjectId) {
    return this.scheduleService.getScheduleByRoomId(id);
  }
}
