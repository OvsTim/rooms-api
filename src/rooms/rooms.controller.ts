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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ROOM_NOT_FOUND } from './room-constants';
import { RoomModel } from './rooms.model';
import { ScheduleService } from '../schedule/schedule.service';
import { Types } from 'mongoose';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly scheduleService: ScheduleService,
  ) {}
  @Post('create')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    const room = await this.roomsService.getRoomById(id);
    if (!room) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return room;
  }
  @Get()
  async getAllRooms(): Promise<RoomModel[]> {
    return this.roomsService.getAllRooms();
  }
  @Delete(':id')
  async deleteRoom(@Param('id') id: string) {
    const room = await this.roomsService.delete(id);
    if (!room) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return await this.scheduleService.deleteScheduleByRoomId(id);
  }
  @Patch(':id')
  async patch(
    @Param('id') id: Types.ObjectId,
    @Body() dto: Partial<RoomModel>,
  ) {
    const room = await this.roomsService.getRoomById(id);
    if (!room) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return this.roomsService.editRoom(id, dto);
  }
}
