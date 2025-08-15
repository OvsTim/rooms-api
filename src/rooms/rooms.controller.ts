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
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ROOM_NOT_FOUND } from './room-constants';
import { RoomModel } from './rooms.model';
import { ScheduleService } from '../schedule/schedule.service';
import { Types } from 'mongoose';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserEnum } from '../users/users.model';
import { RolesGuard } from '../auth/guards/roles.guard';

@UsePipes(new ValidationPipe())
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Roles(UserEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('create')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get(':id')
  async getRoom(@Param('id') id: Types.ObjectId) {
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

  @Roles(UserEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deleteRoom(@Param('id') id: Types.ObjectId) {
    const room = await this.roomsService.delete(id);
    if (!room) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return await this.scheduleService.deleteScheduleByRoomId(id);
  }

  @Roles(UserEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async patch(@Param('id') id: Types.ObjectId, @Body() dto: UpdateRoomDto) {
    const room = await this.roomsService.getRoomById(id);
    if (!room) {
      throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return this.roomsService.editRoom(id, dto);
  }
}
