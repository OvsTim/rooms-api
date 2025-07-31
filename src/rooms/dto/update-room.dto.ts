import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdateRoomDto {
  @IsNumber()
  number?: number;
  @IsString()
  type?: string;
  @IsBoolean()
  hasSeaView?: boolean;
}
