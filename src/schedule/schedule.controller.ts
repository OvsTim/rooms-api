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
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { RoomsService } from '../rooms/rooms.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ROOM_SCHEDULED, SCHEDULE_NOT_FOUND } from './schedule-constants';
import { ScheduleModel } from './schedule.model';
import { areDatesEqual } from '../utils/dateUtils';
import { ROOM_NOT_FOUND } from '../rooms/room-constants';
import { Types } from 'mongoose';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserEnum, UserModel } from '../users/users.model';
import { User } from '../decorators/user-email.decorator';
import { TelegramService } from '../telegram/telegram.service';

@UsePipes(new ValidationPipe())
@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly roomsService: RoomsService,
    private readonly telegramService: TelegramService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create')
  @UsePipes(ValidationPipe)
  @Roles(UserEnum.USER)
  async createSchedule(@Body() dto: CreateScheduleDto) {
    const room = await this.roomsService.getRoomById(dto.roomId);
    if (!room) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const schedules = await this.scheduleService.getScheduleByRoomId(
      dto.roomId,
    );

    if (schedules && schedules.length > 0) {
      for (const schedule of schedules) {
        if (areDatesEqual(schedule.date, dto.date)) {
          throw new HttpException(ROOM_SCHEDULED, HttpStatus.CONFLICT);
        }
      }
    }

    return await this.scheduleService.create(dto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create/notify')
  @UsePipes(ValidationPipe)
  @Roles(UserEnum.USER)
  async createScheduleNotify(
    @User() user: UserModel,
    @Body() dto: CreateScheduleDto,
  ) {
    const message = `Новое бронирование\nИмя: ${user.name}\nТелефон: ${user.phone}\nДата: ${dto.date.toISOString()}\nИД комнаты: ${dto.roomId.toString()}`;
    return await this.telegramService.sendMessage(message);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserEnum.USER)
  @Delete(':id')
  async deleteSchedule(@Param('id') id: Types.ObjectId) {
    const schedule = await this.scheduleService.getScheduleById(id);
    if (!schedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return this.scheduleService.delete(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserEnum.USER)
  @Delete('notify/:id')
  async deleteScheduleNotify(
    @User() user: UserModel,
    @Param('id') id: Types.ObjectId,
  ) {
    const message = `Отмена бронирования\nИД: ${id.toString()}\nИмя: ${user.name}\nТелефон: ${user.phone}`;
    return this.telegramService.sendMessage(message);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserEnum.USER)
  @Patch(':id')
  async patch(@Param('id') id: Types.ObjectId, @Body() dto: UpdateScheduleDto) {
    const currentSchedules = await this.scheduleService.getAllSchedules();
    console.log('currentSchedules', currentSchedules);
    console.log('dto', dto);

    const currentSchedule = await this.scheduleService.getScheduleById(id);
    if (!currentSchedule) {
      throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (dto.roomId !== undefined) {
      const roomExists = await this.roomsService.getRoomById(
        new Types.ObjectId(dto.roomId),
      );
      if (!roomExists) {
        throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
    }

    const targetRoomId =
      dto.roomId !== undefined ? dto.roomId : currentSchedule.roomId;
    const targetDate = dto.date !== undefined ? dto.date : currentSchedule.date;

    if (dto.roomId !== undefined || dto.date !== undefined) {
      const roomSchedules = await this.scheduleService.getScheduleByRoomId(
        new Types.ObjectId(targetRoomId),
      );

      const hasConflict = roomSchedules.some((schedule) => {
        // Пропускаем текущее бронирование
        if (schedule._id.equals(id)) return false;

        return areDatesEqual(schedule.date, targetDate);
      });

      if (hasConflict) {
        throw new HttpException(ROOM_SCHEDULED, HttpStatus.CONFLICT);
      }
    }

    return this.scheduleService.editSchedule(id, dto);
  }
  @Get('byRoom/:roomId')
  async get(@Param('roomId') roomId: Types.ObjectId) {
    return this.scheduleService.getScheduleByRoomId(roomId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserEnum.ADMIN)
  @Get('room-bookings')
  async getRoomBookingStats(
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.scheduleService.getRoomBookingStats(year, month);
  }
}
