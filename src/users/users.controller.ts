import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from './users.service';
import { USER_NOT_FOUND } from './users.constants';
import { UserModel } from './users.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@UsePipes(new ValidationPipe())
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: Types.ObjectId) {
    const room = await this.userService.getById(id);
    if (!room) {
      throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return room;
  }
  @Get()
  async getAllUSers(): Promise<UserModel[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: Types.ObjectId) {
    const user = await this.userService.getById(id);
    if (!user) {
      throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return this.userService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async patch(@Param('id') id: Types.ObjectId, @Body() dto: UpdateUserDto) {
    const user = await this.userService.getById(id);
    if (!user) {
      throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return this.userService.updateUser(id, dto);
  }
}
