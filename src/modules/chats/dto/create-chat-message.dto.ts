import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateChatMessageDto {
  @ApiProperty({ type: 'string', minLength: 2, maxLength: 5000 })
  @Length(2, 5000)
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @Length(26, 26)
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
