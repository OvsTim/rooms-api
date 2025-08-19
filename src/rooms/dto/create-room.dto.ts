import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsNumber()
  number: number;
  @IsString()
  type: string;
  @IsBoolean()
  hasSeaView: boolean;
  @IsArray()
  @IsString({ each: true })
  images: string[];
}
