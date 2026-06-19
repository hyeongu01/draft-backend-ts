import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

const ULID_REGEX = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i;

export class CreateChatRoomDto {
  @ApiProperty()
  @Matches(ULID_REGEX)
  @IsString()
  @IsNotEmpty()
  resumeId: string;
}
