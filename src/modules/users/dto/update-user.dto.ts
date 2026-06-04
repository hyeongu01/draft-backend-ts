import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  @Length(2, 100)
  @IsString()
  @IsOptional()
  nickname?: string;
}
