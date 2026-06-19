import { ApiProperty } from '@nestjs/swagger';

export class CreateChatRoomResponseType {
  @ApiProperty()
  roomId: string;
}
